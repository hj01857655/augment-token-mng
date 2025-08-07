use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use std::time::{Duration, Instant};


#[derive(Debug, Clone)]
pub struct CacheEntry<T> {
    pub data: T,
    pub expires_at: Instant,
}

impl<T> CacheEntry<T> {
    pub fn new(data: T, ttl: Duration) -> Self {
        Self {
            data,
            expires_at: Instant::now() + ttl,
        }
    }

    pub fn is_expired(&self) -> bool {
        Instant::now() > self.expires_at
    }
}

#[derive(Debug)]
pub struct MemoryCache<T> {
    store: Arc<RwLock<HashMap<String, CacheEntry<T>>>>,
}

impl<T: Clone> MemoryCache<T> {
    pub fn new() -> Self {
        Self {
            store: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn get(&self, key: &str) -> Option<T> {
        let store = self.store.read().unwrap();
        if let Some(entry) = store.get(key) {
            if !entry.is_expired() {
                return Some(entry.data.clone());
            }
        }
        None
    }

    pub fn set(&self, key: String, value: T, ttl: Duration) {
        let mut store = self.store.write().unwrap();
        store.insert(key, CacheEntry::new(value, ttl));
    }

    pub fn remove(&self, key: &str) {
        let mut store = self.store.write().unwrap();
        store.remove(key);
    }

    pub fn clear(&self) {
        let mut store = self.store.write().unwrap();
        store.clear();
    }

    pub fn cleanup_expired(&self) {
        let mut store = self.store.write().unwrap();
        store.retain(|_, entry| !entry.is_expired());
    }

    pub fn size(&self) -> usize {
        let store = self.store.read().unwrap();
        store.len()
    }
}

impl<T: Clone> Default for MemoryCache<T> {
    fn default() -> Self {
        Self::new()
    }
}

// Specific cache types for our application
pub type TokenCache = MemoryCache<String>;
pub type AccountStatusCache = MemoryCache<crate::augment_oauth::AccountStatus>;
pub type ApiResponseCache = MemoryCache<String>;

// Cache manager to hold all caches
#[derive(Debug)]
pub struct CacheManager {
    pub token_cache: TokenCache,
    pub account_status_cache: AccountStatusCache,
    pub api_response_cache: ApiResponseCache,
}

impl CacheManager {
    pub fn new() -> Self {
        Self {
            token_cache: TokenCache::new(),
            account_status_cache: AccountStatusCache::new(),
            api_response_cache: ApiResponseCache::new(),
        }
    }

    pub fn cleanup_all_expired(&self) {
        self.token_cache.cleanup_expired();
        self.account_status_cache.cleanup_expired();
        self.api_response_cache.cleanup_expired();
    }

    pub fn clear_all(&self) {
        self.token_cache.clear();
        self.account_status_cache.clear();
        self.api_response_cache.clear();
    }
}

impl Default for CacheManager {
    fn default() -> Self {
        Self::new()
    }
}

// Cache key generators
pub fn token_cache_key(tenant_url: &str, token: &str) -> String {
    format!("token:{}:{}", tenant_url, &token[..std::cmp::min(token.len(), 10)])
}

pub fn account_status_cache_key(tenant_url: &str, token: &str) -> String {
    format!("account_status:{}:{}", tenant_url, &token[..std::cmp::min(token.len(), 10)])
}

pub fn api_response_cache_key(endpoint: &str, params: &str) -> String {
    format!("api:{}:{}", endpoint, params)
}

// Cache TTL constants
pub const TOKEN_CACHE_TTL: Duration = Duration::from_secs(300); // 5 minutes
pub const ACCOUNT_STATUS_CACHE_TTL: Duration = Duration::from_secs(600); // 10 minutes
pub const API_RESPONSE_CACHE_TTL: Duration = Duration::from_secs(180); // 3 minutes
