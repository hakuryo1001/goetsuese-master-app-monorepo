use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;
use tracing::error;
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

pub mod translit_spawn;

pub struct AppState {
    pub http: reqwest::Client,
    /// Base URL of the Python transliteration worker (no trailing slash).
    pub translit_base: String,
    /// When the API auto-starts uvicorn, this keeps the child alive until shutdown.
    pub _translit_worker: Option<tokio::process::Child>,
}

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TransliterateRequest {
    pub text: Option<String>,
    #[serde(default = "default_mode")]
    pub mode: String,
    #[serde(default = "default_orthography")]
    pub orthography: String,
    #[serde(default = "default_true")]
    pub use_repeat_char: bool,
    #[serde(default = "default_initial_r")]
    pub initial_r_block: String,
    #[serde(default = "default_v_block")]
    pub v_block: String,
    #[serde(default = "default_true")]
    pub use_schwa_char: bool,
    #[serde(default = "default_tone")]
    pub tone_config: String,
    #[serde(default = "default_algorithm")]
    pub algorithm: String,
    #[serde(default = "default_true")]
    pub sep_eng_words: bool,
    #[serde(default)]
    pub legacy_web_dots: bool,
}

fn default_mode() -> String {
    "font".into()
}
fn default_orthography() -> String {
    "jcz_only".into()
}
fn default_true() -> bool {
    true
}
fn default_initial_r() -> String {
    "wl".into()
}
fn default_v_block() -> String {
    "f".into()
}
fn default_tone() -> String {
    "vertical".into()
}
fn default_algorithm() -> String {
    "PyCantonese".into()
}

#[derive(Debug, Deserialize, Serialize, utoipa::ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct TransliterateResponse {
    pub translated_text: String,
}

#[derive(Debug, Serialize)]
struct ErrorBody {
    error: String,
}

pub struct ApiError(pub StatusCode, pub String);

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let body = Json(ErrorBody { error: self.1 });
        (self.0, body).into_response()
    }
}

fn summarize_upstream_error(status: reqwest::StatusCode, body: &str) -> String {
    if let Ok(v) = serde_json::from_str::<serde_json::Value>(body) {
        if let Some(d) = v.get("detail") {
            if let Some(s) = d.as_str() {
                return format!("Transliteration worker {status}: {s}");
            }
            return format!("Transliteration worker {status}: {d}");
        }
    }
    let clipped: String = body.chars().take(160).collect();
    if clipped.is_empty() {
        format!("Transliteration worker returned HTTP {status}")
    } else {
        format!("Transliteration worker HTTP {status}: {clipped}")
    }
}

#[utoipa::path(
    post,
    path = "/v1/transliterate",
    request_body = TransliterateRequest,
    responses(
        (status = 200, description = "Success", body = TransliterateResponse),
        (status = 400, description = "Bad request"),
        (status = 502, description = "Transliteration worker error"),
    )
)]
pub async fn transliterate_handler(
    State(state): State<Arc<AppState>>,
    Json(body): Json<TransliterateRequest>,
) -> Result<Json<TransliterateResponse>, ApiError> {
    const MAX: usize = 50_000;
    let text = body.text.as_deref().unwrap_or("");
    if text.is_empty() {
        return Err(ApiError(
            StatusCode::BAD_REQUEST,
            "text is required".into(),
        ));
    }
    if text.len() > MAX {
        return Err(ApiError(
            StatusCode::BAD_REQUEST,
            format!("text exceeds {MAX} bytes"),
        ));
    }

    let url = format!("{}/v1/transliterate", state.translit_base.trim_end_matches('/'));
    let upstream = state
        .http
        .post(&url)
        .json(&body)
        .timeout(std::time::Duration::from_secs(120))
        .send()
        .await
        .map_err(|e| {
            error!(error = %e, %url, "translit request failed");
            ApiError(
                StatusCode::BAD_GATEWAY,
                format!("transliteration worker unreachable: {e}"),
            )
        })?;

    if !upstream.status().is_success() {
        let status = upstream.status();
        let detail = upstream.text().await.unwrap_or_default();
        error!(%status, %detail, "translit upstream error");
        let msg = summarize_upstream_error(status, &detail);
        return Err(ApiError(StatusCode::BAD_GATEWAY, msg));
    }

    #[derive(Deserialize)]
    struct UpstreamBody {
        #[serde(rename = "translatedText")]
        translated_text: String,
    }

    let parsed: UpstreamBody = upstream.json().await.map_err(|e| {
        error!(error = %e, "invalid JSON from translit worker");
        ApiError(
            StatusCode::BAD_GATEWAY,
            "invalid response from transliteration worker".into(),
        )
    })?;

    Ok(Json(TransliterateResponse {
        translated_text: parsed.translated_text,
    }))
}

async fn health() -> impl IntoResponse {
    Json(serde_json::json!({ "status": "ok" }))
}

async fn ready(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let mut ok = true;
    let mut checks = serde_json::Map::new();

    let turl = format!("{}/health", state.translit_base.trim_end_matches('/'));
    match state.http.get(&turl).timeout(std::time::Duration::from_secs(5)).send().await {
        Ok(r) if r.status().is_success() => {
            checks.insert("transliteration".into(), "ok".into());
        }
        Ok(r) => {
            ok = false;
            checks.insert(
                "transliteration".into(),
                format!("bad status {}", r.status()).into(),
            );
        }
        Err(e) => {
            ok = false;
            checks.insert("transliteration".into(), e.to_string().into());
        }
    }

    let status = if ok {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    (status, Json(serde_json::json!({ "ok": ok, "checks": checks })))
}

#[derive(OpenApi)]
#[openapi(
    paths(transliterate_handler),
    components(schemas(TransliterateRequest, TransliterateResponse))
)]
struct ApiDoc;

pub fn build_router(state: Arc<AppState>, cors: CorsLayer) -> Router {
    Router::new()
        .route("/health", get(health))
        .route("/ready", get(ready))
        .route("/v1/transliterate", post(transliterate_handler))
        .merge(SwaggerUi::new("/swagger-ui").url("/openapi.json", ApiDoc::openapi()))
        .layer(cors)
        .with_state(state)
}
