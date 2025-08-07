use crate::error::{AppError, AppResult};
use crate::cache::{CacheManager, API_RESPONSE_CACHE_TTL};
use reqwest::{Client, Response};
use std::sync::Arc;

/// Common headers for API requests
pub fn get_common_headers() -> Vec<(&'static str, &'static str)> {
    vec![
        ("Accept", "application/json, text/plain, */*"),
        ("Accept-Language", "en-US,en;q=0.9"),
        ("Accept-Charset", "utf-8"),
        ("Connection", "keep-alive"),
        ("Sec-Fetch-Dest", "empty"),
        ("Sec-Fetch-Mode", "cors"),
        ("Sec-Fetch-Site", "same-origin"),
    ]
}

/// Process API response and format JSON
pub async fn process_api_response(response: Response) -> AppResult<String> {
    let status = response.status();

    if status.is_success() {
        let bytes = response
            .bytes()
            .await
            .map_err(|e| AppError::http_request(format!("Failed to read response bytes: {}", e)))?;

        let response_text = String::from_utf8_lossy(&bytes).to_string();

        let result = match serde_json::from_str::<serde_json::Value>(&response_text) {
            Ok(json_value) => {
                match serde_json::to_string_pretty(&json_value) {
                    Ok(formatted) => formatted,
                    Err(_) => response_text,
                }
            }
            Err(_) => response_text,
        };

        Ok(result)
    } else {
        let response_text = response
            .text()
            .await
            .map_err(|e| AppError::http_request(format!("Failed to read error response: {}", e)))?;
        
        Err(AppError::http_request(format!("API request failed with status {}: {}", status, response_text)))
    }
}

/// Make a cached API request
pub async fn make_cached_api_request(
    client: &Client,
    url: &str,
    cache_manager: &Arc<CacheManager>,
    cache_key: String,
) -> AppResult<String> {
    // Try to get from cache first
    if let Some(cached_response) = cache_manager.api_response_cache.get(&cache_key) {
        return Ok(cached_response);
    }

    // Build request with common headers
    let mut request = client.get(url);
    for (key, value) in get_common_headers() {
        request = request.header(key, value);
    }

    // Make the request
    let response = request
        .send()
        .await
        .map_err(|e| AppError::http_request(format!("Failed to make API request: {}", e)))?;

    // Process the response
    let result = process_api_response(response).await?;

    // Cache the successful result
    cache_manager.api_response_cache.set(cache_key, result.clone(), API_RESPONSE_CACHE_TTL);

    Ok(result)
}

/// Validate token format
pub fn validate_token(token: &str) -> AppResult<()> {
    if token.is_empty() {
        return Err(AppError::validation("Token cannot be empty"));
    }
    
    if token.len() < 10 {
        return Err(AppError::validation("Token is too short"));
    }
    
    Ok(())
}

/// Validate URL format
#[allow(dead_code)]
pub fn validate_url(url: &str) -> AppResult<()> {
    if url.is_empty() {
        return Err(AppError::validation("URL cannot be empty"));
    }
    
    if !url.starts_with("http://") && !url.starts_with("https://") {
        return Err(AppError::validation("URL must start with http:// or https://"));
    }
    
    Ok(())
}

/// Generate a safe cache key from sensitive data
pub fn generate_safe_cache_key(prefix: &str, sensitive_data: &str) -> String {
    let safe_part = if sensitive_data.len() > 10 {
        &sensitive_data[..10]
    } else {
        sensitive_data
    };
    format!("{}:{}", prefix, safe_part)
}

/// Truncate string for logging (to avoid logging sensitive data)
#[allow(dead_code)]
pub fn truncate_for_log(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}
