use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AppError {
    TokenManager(String),
    BookmarkManager(String),
    OAuth(String),
    HttpRequest(String),
    Cache(String),
    FileSystem(String),
    Serialization(String),
    Validation(String),
    NotFound(String),
    Unauthorized(String),
    Internal(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::TokenManager(msg) => write!(f, "Token Manager Error: {}", msg),
            AppError::BookmarkManager(msg) => write!(f, "Bookmark Manager Error: {}", msg),
            AppError::OAuth(msg) => write!(f, "OAuth Error: {}", msg),
            AppError::HttpRequest(msg) => write!(f, "HTTP Request Error: {}", msg),
            AppError::Cache(msg) => write!(f, "Cache Error: {}", msg),
            AppError::FileSystem(msg) => write!(f, "File System Error: {}", msg),
            AppError::Serialization(msg) => write!(f, "Serialization Error: {}", msg),
            AppError::Validation(msg) => write!(f, "Validation Error: {}", msg),
            AppError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized: {}", msg),
            AppError::Internal(msg) => write!(f, "Internal Error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

impl From<Box<dyn std::error::Error>> for AppError {
    fn from(error: Box<dyn std::error::Error>) -> Self {
        AppError::Internal(error.to_string())
    }
}

impl From<reqwest::Error> for AppError {
    fn from(error: reqwest::Error) -> Self {
        AppError::HttpRequest(error.to_string())
    }
}

impl From<serde_json::Error> for AppError {
    fn from(error: serde_json::Error) -> Self {
        AppError::Serialization(error.to_string())
    }
}

impl From<std::io::Error> for AppError {
    fn from(error: std::io::Error) -> Self {
        AppError::FileSystem(error.to_string())
    }
}

// Convert AppError to String for Tauri commands
impl From<AppError> for String {
    fn from(error: AppError) -> Self {
        error.to_string()
    }
}

// Result type alias for convenience
pub type AppResult<T> = Result<T, AppError>;

// Helper functions for creating specific errors
impl AppError {
    pub fn token_manager<S: Into<String>>(msg: S) -> Self {
        AppError::TokenManager(msg.into())
    }

    pub fn bookmark_manager<S: Into<String>>(msg: S) -> Self {
        AppError::BookmarkManager(msg.into())
    }

    pub fn oauth<S: Into<String>>(msg: S) -> Self {
        AppError::OAuth(msg.into())
    }

    pub fn http_request<S: Into<String>>(msg: S) -> Self {
        AppError::HttpRequest(msg.into())
    }

    pub fn cache<S: Into<String>>(msg: S) -> Self {
        AppError::Cache(msg.into())
    }

    pub fn validation<S: Into<String>>(msg: S) -> Self {
        AppError::Validation(msg.into())
    }

    pub fn not_found<S: Into<String>>(msg: S) -> Self {
        AppError::NotFound(msg.into())
    }

    pub fn unauthorized<S: Into<String>>(msg: S) -> Self {
        AppError::Unauthorized(msg.into())
    }

    pub fn internal<S: Into<String>>(msg: S) -> Self {
        AppError::Internal(msg.into())
    }
}

// Macro for easy error creation
#[macro_export]
macro_rules! app_error {
    ($variant:ident, $msg:expr) => {
        AppError::$variant($msg.to_string())
    };
    ($variant:ident, $fmt:expr, $($arg:tt)*) => {
        AppError::$variant(format!($fmt, $($arg)*))
    };
}

// Macro for converting Results
#[macro_export]
macro_rules! map_err {
    ($result:expr, $variant:ident) => {
        $result.map_err(|e| AppError::$variant(e.to_string()))
    };
    ($result:expr, $variant:ident, $msg:expr) => {
        $result.map_err(|e| AppError::$variant(format!("{}: {}", $msg, e)))
    };
}
