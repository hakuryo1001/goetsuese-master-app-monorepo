//! Spawn the Python uvicorn worker when targeting loopback and nothing answers /health.

use std::path::{Path, PathBuf};
use std::time::Duration;

use anyhow::{bail, Context};
use reqwest::Client;
use tokio::process::Command;
use tokio::time::sleep;
use tracing::info;
use url::Url;

/// Directory containing `main.py` (defaults to monorepo `transliteration/` next to `backend/`).
pub fn default_translit_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../transliteration")
}

fn translit_base_is_loopback(base: &str) -> bool {
    let Ok(url) = Url::parse(base) else {
        return false;
    };
    match url.host() {
        Some(url::Host::Domain(name)) => name.eq_ignore_ascii_case("localhost"),
        Some(url::Host::Ipv4(ip)) => ip.is_loopback(),
        Some(url::Host::Ipv6(ip)) => ip.is_loopback(),
        None => false,
    }
}

pub fn should_auto_spawn(translit_base: &str) -> bool {
    if !translit_base_is_loopback(translit_base) {
        return false;
    }
    match std::env::var("TRANSLIT_AUTO_SPAWN") {
        Ok(v) => {
            let v = v.to_ascii_lowercase();
            if matches!(v.as_str(), "0" | "false" | "no" | "off") {
                return false;
            }
            if matches!(v.as_str(), "1" | "true" | "yes" | "on") {
                return true;
            }
        }
        Err(_) => {}
    }
    // Default: auto when URL points at loopback (typical local dev).
    true
}

fn uvicorn_listen_host(url: &Url) -> String {
    match url.host() {
        Some(url::Host::Ipv4(ip)) if ip.is_loopback() => ip.to_string(),
        Some(url::Host::Ipv6(ip)) if ip.is_loopback() => format!("{ip}"),
        Some(url::Host::Domain(_)) => "127.0.0.1".to_string(),
        _ => "127.0.0.1".to_string(),
    }
}

fn uvicorn_port(url: &Url) -> u16 {
    // Default 8081 matches TRANSLIT_SERVICE_URL when no port is given (avoids binding :80 locally).
    url.port().unwrap_or(8081)
}

/// `TRANSLIT_PYTHON` if set; else `transliteration/.venv/.../python` when present; else `python3` on PATH.
fn resolved_python_for_translit(translit_dir: &Path) -> PathBuf {
    if let Some(p) = std::env::var_os("TRANSLIT_PYTHON") {
        return PathBuf::from(p);
    }
    let venv_python = if cfg!(windows) {
        translit_dir.join(".venv").join("Scripts").join("python.exe")
    } else {
        translit_dir.join(".venv").join("bin").join("python")
    };
    if venv_python.is_file() {
        venv_python
    } else {
        PathBuf::from("python3")
    }
}

async fn probe_ok(http: &Client, health_url: &str) -> bool {
    match http
        .get(health_url)
        .timeout(Duration::from_secs(2))
        .send()
        .await
    {
        Ok(r) => r.status().is_success(),
        Err(_) => false,
    }
}

fn log_python_engine_running(translit_base: &str, started_by_this_api: bool) {
    if started_by_this_api {
        info!(
            target = %translit_base,
            "Python transliteration engine is running (uvicorn child started by this API)"
        );
    } else {
        info!(
            target = %translit_base,
            "Python transliteration engine is running (/health OK; not started by this API)"
        );
    }
}

/// If auto-spawn is enabled and `/health` fails, start `uvicorn` and wait until healthy.
pub async fn ensure_translit_worker(
    http: &Client,
    translit_base: &str,
) -> anyhow::Result<Option<tokio::process::Child>> {
    let base = translit_base.trim_end_matches('/');
    let health_url = format!("{base}/health");

    if !should_auto_spawn(translit_base) {
        if probe_ok(http, &health_url).await {
            info!(
                target = %base,
                "Python transliteration engine is running (/health OK; auto-spawn disabled, worker is external)"
            );
        }
        return Ok(None);
    }

    if probe_ok(http, &health_url).await {
        log_python_engine_running(base, false);
        return Ok(None);
    }

    let url = Url::parse(base).context("TRANSLIT_SERVICE_URL is not a valid URL")?;
    let host = uvicorn_listen_host(&url);
    let port = uvicorn_port(&url);

    let dir = std::env::var_os("TRANSLIT_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(default_translit_dir);
    let main_py = dir.join("main.py");
    if !main_py.is_file() {
        bail!(
            "transliteration worker is down and auto-spawn cannot run: {} missing (clone submodules; or set TRANSLIT_DIR)",
            main_py.display()
        );
    }

    let python = resolved_python_for_translit(&dir);

    info!(
        dir = %dir.display(),
        python = %python.display(),
        %host,
        %port,
        "spawning transliteration worker (uvicorn); set TRANSLIT_AUTO_SPAWN=false to disable; set TRANSLIT_PYTHON or create transliteration/.venv"
    );

    let mut cmd = Command::new(&python);
    cmd.current_dir(&dir)
        .args([
            "-m",
            "uvicorn",
            "main:app",
            "--host",
            &host,
            "--port",
            &port.to_string(),
        ])
        .kill_on_drop(true)
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::inherit())
        .stderr(std::process::Stdio::inherit());

    let child = cmd
        .spawn()
        .with_context(|| {
            format!(
                "failed to spawn uvicorn with {} — use Python 3.11+ in transliteration/.venv (see README): cd {} && python3.11 -m venv .venv && .venv/bin/pip install -r requirements.txt; or export TRANSLIT_PYTHON=/path/to/venv/bin/python",
                python.display(),
                dir.display()
            )
        })?;

    for attempt in 0..90 {
        sleep(Duration::from_millis(400)).await;
        if probe_ok(http, &health_url).await {
            info!(attempt, "transliteration worker /health OK after spawn");
            log_python_engine_running(base, true);
            return Ok(Some(child));
        }
    }

    bail!(
        "transliteration worker did not become healthy within ~36s ({}). If you saw 'No module named uvicorn', create {} and install requirements.txt (Python 3.11 recommended), or set TRANSLIT_PYTHON.",
        health_url,
        dir.join(".venv").display()
    );
}
