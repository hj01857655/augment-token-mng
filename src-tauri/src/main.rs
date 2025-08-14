// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod augment_oauth;
mod storage;

mod http_server;
mod cache;
mod error;
mod api_utils;

use augment_oauth::{create_augment_oauth_state, generate_augment_authorize_url, complete_augment_oauth_flow, check_account_ban_status, AugmentOAuthState, AugmentTokenResponse, AccountStatus};
use storage::{TokenManager, StoredToken, PortalInfo};

use http_server::HttpServer;
use cache::{CacheManager, account_status_cache_key, ACCOUNT_STATUS_CACHE_TTL};
use api_utils::{make_cached_api_request, validate_token, generate_safe_cache_key};
use std::sync::{Mutex, Arc};
use tauri::{State, Manager};
use chrono;
use reqwest::Client;
use std::time::Duration;

// Global HTTP client for reuse across all requests
fn create_http_client() -> Client {
    Client::builder()
        .timeout(Duration::from_secs(30))
        .pool_max_idle_per_host(10)
        .pool_idle_timeout(Duration::from_secs(90))
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .build()
        .expect("Failed to create HTTP client")
}

// Global state to store OAuth state and shared resources
struct AppState {
    augment_oauth_state: Mutex<Option<AugmentOAuthState>>,
    #[allow(dead_code)]
    http_server: Mutex<Option<HttpServer>>,
    http_client: Arc<Client>,
    cache_manager: Arc<CacheManager>,
}



#[tauri::command]
async fn generate_augment_auth_url(state: State<'_, AppState>) -> Result<String, String> {
    let augment_oauth_state = create_augment_oauth_state();
    let auth_url = generate_augment_authorize_url(&augment_oauth_state)
        .map_err(|e| format!("Failed to generate Augment auth URL: {}", e))?;
    
    // Store the Augment OAuth state
    *state.augment_oauth_state.lock().unwrap() = Some(augment_oauth_state);
    
    Ok(auth_url)
}





#[tauri::command]
async fn get_augment_token(code: String, state: State<'_, AppState>) -> Result<AugmentTokenResponse, String> {
    let augment_oauth_state = {
        let guard = state.augment_oauth_state.lock().unwrap();
        guard.clone()
            .ok_or("No Augment OAuth state found. Please generate auth URL first.")?
    };

    complete_augment_oauth_flow(&augment_oauth_state, &code, &state.http_client)
        .await
        .map_err(|e| format!("Failed to complete Augment OAuth flow: {}", e))
}

#[tauri::command]
async fn check_account_status(token: String, tenant_url: String, state: State<'_, AppState>) -> Result<AccountStatus, String> {
    let cache_key = account_status_cache_key(&tenant_url, &token);

    // Try to get from cache first
    if let Some(cached_status) = state.cache_manager.account_status_cache.get(&cache_key) {
        return Ok(cached_status);
    }

    // If not in cache, make the API call
    let status = check_account_ban_status(&token, &tenant_url, &state.http_client)
        .await
        .map_err(|e| format!("Failed to check account status: {}", e))?;

    // Cache the result
    state.cache_manager.account_status_cache.set(cache_key, status.clone(), ACCOUNT_STATUS_CACHE_TTL);

    Ok(status)
}

#[tauri::command]
async fn open_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    use tauri_plugin_opener::OpenerExt;
    app.opener().open_url(url, None::<&str>)
        .map_err(|e| format!("Failed to open URL: {}", e))
}

#[tauri::command]
async fn save_token(
    tenant_url: String,
    access_token: String,
    portal_url: Option<String>,
    email_note: Option<String>,
    app: tauri::AppHandle,
) -> Result<String, String> {
    let token_manager = TokenManager::new(&app)
        .map_err(|e| format!("Failed to initialize token manager: {}", e))?;

    token_manager.add_token_with_details(tenant_url, access_token, portal_url, email_note)
        .await
        .map_err(|e| format!("Failed to save token: {}", e))
}

#[tauri::command]
async fn get_all_tokens(
    app: tauri::AppHandle,
) -> Result<Vec<StoredToken>, String> {
    let token_manager = TokenManager::new(&app)
        .map_err(|e| format!("Failed to initialize token manager: {}", e))?;

    token_manager.get_all_tokens()
        .await
        .map_err(|e| format!("Failed to load tokens: {}", e))
}

#[tauri::command]
async fn delete_token(
    id: String,
    app: tauri::AppHandle,
) -> Result<bool, String> {
    let token_manager = TokenManager::new(&app)
        .map_err(|e| format!("Failed to initialize token manager: {}", e))?;

    token_manager.remove_token(&id)
        .await
        .map_err(|e| format!("Failed to delete token: {}", e))
}

#[tauri::command]
async fn update_token(
    id: String,
    tenant_url: String,
    access_token: String,
    portal_url: Option<String>,
    email_note: Option<String>,
    app: tauri::AppHandle,
) -> Result<bool, String> {
    let token_manager = TokenManager::new(&app)
        .map_err(|e| format!("Failed to initialize token manager: {}", e))?;

    token_manager.update_token_with_details(&id, tenant_url, access_token, portal_url, email_note)
        .await
        .map_err(|e| format!("Failed to update token: {}", e))
}

#[tauri::command]
async fn update_token_ban_status(
    id: String,
    ban_status: Option<String>,
    app: tauri::AppHandle,
) -> Result<bool, String> {
    let token_manager = TokenManager::new(&app)
        .map_err(|e| format!("Failed to initialize token manager: {}", e))?;

    token_manager.update_token_ban_status(&id, ban_status)
        .await
        .map_err(|e| format!("Failed to update token ban status: {}", e))
}

#[tauri::command]
async fn update_token_portal_info(
    id: String,
    credits_balance: i64,
    expiry_date: String,
    is_active: bool,
    app: tauri::AppHandle,
) -> Result<bool, String> {
    println!("update_token_portal_info called with:");
    println!("  id: {}", id);
    println!("  credits_balance: {}", credits_balance);
    println!("  expiry_date: {}", expiry_date);
    println!("  is_active: {}", is_active);

    let token_manager = TokenManager::new(&app)
        .map_err(|e| format!("Failed to initialize token manager: {}", e))?;

    let portal_info = PortalInfo {
        credits_balance,
        expiry_date,
        is_active,
        last_updated: chrono::Utc::now(),
    };

    let result = token_manager.update_token_portal_info(&id, Some(portal_info))
        .await
        .map_err(|e| format!("Failed to update token portal info: {}", e))?;

    println!("Portal info update result: {}", result);
    Ok(result)
}













#[tauri::command]
async fn get_customer_info(token: String, state: State<'_, AppState>) -> Result<String, String> {
    // Validate input
    validate_token(&token).map_err(|e| e.to_string())?;

    let cache_key = generate_safe_cache_key("customer_info", &token);
    let url = format!("https://portal.withorb.com/api/v1/customer_from_link?token={}", token);

    make_cached_api_request(&state.http_client, &url, &state.cache_manager, cache_key)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_ledger_summary(customer_id: String, pricing_unit_id: String, token: String, state: State<'_, AppState>) -> Result<String, String> {
    // Validate inputs
    validate_token(&token).map_err(|e| e.to_string())?;

    if customer_id.is_empty() {
        return Err("Customer ID cannot be empty".to_string());
    }

    if pricing_unit_id.is_empty() {
        return Err("Pricing unit ID cannot be empty".to_string());
    }

    let cache_key = generate_safe_cache_key("ledger_summary", &format!("{}:{}:{}", customer_id, pricing_unit_id, &token));
    let url = format!("https://portal.withorb.com/api/v1/customers/{}/ledger_summary?pricing_unit_id={}&token={}",
                     customer_id, pricing_unit_id, token);

    make_cached_api_request(&state.http_client, &url, &state.cache_manager, cache_key)
        .await
        .map_err(|e| e.to_string())
}



#[tauri::command]
async fn clear_cache(state: State<'_, AppState>) -> Result<(), String> {
    state.cache_manager.clear_all();
    Ok(())
}

#[tauri::command]
async fn cleanup_expired_cache(state: State<'_, AppState>) -> Result<(), String> {
    state.cache_manager.cleanup_all_expired();
    Ok(())
}

#[tauri::command]
async fn open_data_folder(
    app: tauri::AppHandle,
) -> Result<(), String> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Create directory if it doesn't exist
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    // Open folder using system default file manager
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&app_data_dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&app_data_dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&app_data_dir)
            .spawn()
            .map_err(|e| format!("Failed to open folder: {}", e))?;
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            app.manage(AppState {
                augment_oauth_state: Mutex::new(None),
                http_server: Mutex::new(None),
                http_client: Arc::new(create_http_client()),
                cache_manager: Arc::new(CacheManager::new()),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            generate_augment_auth_url,
            get_augment_token,
            check_account_status,
            open_url,
            save_token,
            get_all_tokens,
            delete_token,
            update_token,
            update_token_ban_status,
            update_token_portal_info,

            get_customer_info,
            get_ledger_summary,
            clear_cache,
            cleanup_expired_cache,
            open_data_folder,


        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
