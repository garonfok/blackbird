use sea_orm::DatabaseConnection;

use tauri::{AppHandle, Manager, State};

pub struct AppState {
    pub db: std::sync::Mutex<Option<DatabaseConnection>>,
}

pub trait ServiceAccess {
    fn db<F, TResult>(&self, operation: F) -> TResult
    where
        F: FnOnce(&DatabaseConnection) -> TResult;
}

impl ServiceAccess for AppHandle {
    fn db<F, TResult>(&self, operation: F) -> TResult
    where
        F: FnOnce(&DatabaseConnection) -> TResult,
    {
        let app_state: State<AppState> = self.state();
        let db_connection_guard = app_state.db.lock().unwrap();
        let db = db_connection_guard.as_ref().unwrap();

        operation(db)
    }
}
