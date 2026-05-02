use std::path::PathBuf;
use std::{net::SocketAddr, sync::Arc, time::Duration};

use anyhow::Context;
use axum::http::{HeaderValue, Method};
use backend::{translit_spawn, AppState, build_router};
use reqwest::Client as HttpClient;
use tower_http::cors::{AllowOrigin, Any, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

fn resolve_bind_addr() -> String {
    if let Ok(s) = std::env::var("BIND_ADDR") {
        let t = s.trim();
        if !t.is_empty() {
            return t.to_string();
        }
    }
    if let Ok(port) = std::env::var("PORT") {
        let p = port.trim();
        if !p.is_empty() {
            return format!("0.0.0.0:{p}");
        }
    }
    "0.0.0.0:8787".to_string()
}

fn env_truthy(name: &str) -> bool {
    match std::env::var(name) {
        Ok(v) => {
            let v = v.to_ascii_lowercase();
            matches!(v.as_str(), "1" | "true" | "yes" | "on")
        }
        Err(_) => false,
    }
}

fn required_nonempty_env(name: &'static str) -> anyhow::Result<String> {
    std::env::var(name)
        .map(|s| s.trim().to_string())
        .ok()
        .filter(|s| !s.is_empty())
        .with_context(|| format!("{name} must be set and non-empty when TRANSLIT_MODE=external (see backend/.env.example)"))
}

/// `TRANSLIT_MODE`: `local` | `external`. Missing or empty → `local`. Invalid → bail.
fn parse_translit_mode() -> anyhow::Result<String> {
    let raw = std::env::var("TRANSLIT_MODE").unwrap_or_default();
    let raw = raw.trim().to_ascii_lowercase();
    if raw.is_empty() {
        return Ok("local".into());
    }
    match raw.as_str() {
        "local" => Ok("local".into()),
        "external" => Ok("external".into()),
        _ => anyhow::bail!("Invalid TRANSLIT_MODE: {raw} (expected local or external)"),
    }
}

/// Unset / empty value → `mode_is_local`. True/false tokens explicit; anything else → bail.
fn resolve_auto_spawn(mode_is_local: bool) -> anyhow::Result<bool> {
    let raw = match std::env::var("TRANSLIT_AUTO_SPAWN") {
        Ok(v) => v.trim().to_string(),
        Err(_) => return Ok(mode_is_local),
    };
    if raw.is_empty() {
        return Ok(mode_is_local);
    }
    let t = raw.to_ascii_lowercase();
    match t.as_str() {
        "1" | "true" | "yes" | "on" => Ok(true),
        "0" | "false" | "no" | "off" => Ok(false),
        _ => anyhow::bail!("Invalid TRANSLIT_AUTO_SPAWN: {raw} (use 1|true|yes|on or 0|false|no|off)"),
    }
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let mode = parse_translit_mode()?;
    let mode_is_local = mode == "local";

    let translit_base = if mode_is_local {
        match std::env::var("TRANSLIT_SERVICE_URL") {
            Ok(v) if !v.trim().is_empty() => v.trim().to_string(),
            _ => "http://127.0.0.1:8081".to_string(),
        }
    } else {
        required_nonempty_env("TRANSLIT_SERVICE_URL")?
    };

    let cors_origins = if mode_is_local {
        match std::env::var("CORS_ALLOW_ORIGINS") {
            Ok(v) if !v.trim().is_empty() => v.trim().to_string(),
            _ => "*".to_string(),
        }
    } else {
        required_nonempty_env("CORS_ALLOW_ORIGINS")?
    };

    let allow_auto_spawn = resolve_auto_spawn(mode_is_local)?;

    let translit_dir = std::env::var_os("TRANSLIT_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(translit_spawn::default_translit_dir);
    let translit_python_override = std::env::var_os("TRANSLIT_PYTHON").map(PathBuf::from);

    let http = HttpClient::builder()
        .connect_timeout(std::time::Duration::from_secs(10))
        .build()?;

    let translit_child = translit_spawn::ensure_translit_worker(
        &http,
        &translit_base,
        allow_auto_spawn,
        translit_dir,
        translit_python_override,
    )
    .await?;

    if env_truthy("REQUIRE_TRANSLIT_HEALTH") {
        let health_url = format!("{}/health", translit_base.trim_end_matches('/'));
        let resp = http
            .get(&health_url)
            .timeout(Duration::from_secs(10))
            .send()
            .await
            .with_context(|| format!("REQUIRE_TRANSLIT_HEALTH: request to {health_url} failed"))?;
        if !resp.status().is_success() {
            anyhow::bail!(
                "REQUIRE_TRANSLIT_HEALTH: {health_url} returned {}",
                resp.status()
            );
        }
    }

    let state = Arc::new(AppState {
        http,
        translit_base,
        _translit_worker: translit_child,
    });

    let cors = if cors_origins == "*" {
        CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any)
    } else {
        let list: Result<Vec<HeaderValue>, _> = cors_origins
            .split(',')
            .map(|s| s.trim().parse::<HeaderValue>())
            .collect();
        let list = list.context("invalid CORS_ALLOW_ORIGINS entry (comma-separated origins or *)")?;
        CorsLayer::new()
            .allow_origin(AllowOrigin::list(list))
            .allow_methods([
                Method::GET,
                Method::POST,
                Method::OPTIONS,
            ])
            .allow_headers(Any)
    };

    let app = build_router(state, cors);

    let bind: SocketAddr = resolve_bind_addr()
        .parse()
        .with_context(|| format!("invalid BIND_ADDR / PORT listen address"))?;

    tracing::info!(%bind, %mode, "listening");
    let listener = tokio::net::TcpListener::bind(bind).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
