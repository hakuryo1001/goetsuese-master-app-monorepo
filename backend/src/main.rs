use std::{net::SocketAddr, sync::Arc, time::Duration};

use anyhow::Context;
use backend::{build_router, translit_spawn, AppState};
use mongodb::options::ClientOptions;
use mongodb::Client;
use reqwest::Client as HttpClient;
use axum::http::HeaderValue;
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

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let translit_base = std::env::var("TRANSLIT_SERVICE_URL")
        .unwrap_or_else(|_| "http://127.0.0.1:8081".to_string());

    let mongo = match std::env::var("MONGODB_URI") {
        Ok(uri) if !uri.is_empty() => {
            let opts = ClientOptions::parse(&uri).await?;
            Some(Client::with_options(opts)?)
        }
        _ => None,
    };

    let http = HttpClient::builder()
        .connect_timeout(std::time::Duration::from_secs(10))
        .build()?;

    let translit_child = translit_spawn::ensure_translit_worker(&http, &translit_base).await?;

    if env_truthy("REQUIRE_TRANSLIT_HEALTH") {
        let health_url = format!(
            "{}/health",
            translit_base.trim_end_matches('/')
        );
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
        mongo,
        _translit_worker: translit_child,
    });

    let cors = match std::env::var("CORS_ALLOW_ORIGINS") {
        Ok(origins) if !origins.is_empty() && origins != "*" => {
            let list: Result<Vec<HeaderValue>, _> = origins
                .split(',')
                .map(|s| s.trim().parse::<HeaderValue>())
                .collect();
            let list = list.expect("invalid CORS_ALLOW_ORIGINS entry");
            CorsLayer::new()
                .allow_origin(AllowOrigin::list(list))
                .allow_methods(Any)
                .allow_headers(Any)
        }
        _ => CorsLayer::new()
            .allow_origin(Any)
            .allow_methods(Any)
            .allow_headers(Any),
    };

    let app = build_router(state, cors);

    let bind: SocketAddr = resolve_bind_addr()
        .parse()
        .with_context(|| format!("invalid BIND_ADDR / PORT listen address"))?;

    tracing::info!(%bind, "listening");
    let listener = tokio::net::TcpListener::bind(bind).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
