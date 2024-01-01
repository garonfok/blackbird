use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::instruments;

#[command]
pub fn instruments_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(instruments::get_all(db)));
    match result {
        Ok(instruments) => Ok(instruments),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn instruments_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(instruments::get_by_id(db, id)));
    match result {
        Ok(instrument) => Ok(instrument),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn instruments_add(
    app_handle: AppHandle,
    name: String,
    category: Option<String>,
    is_default: bool,
) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(instruments::add(db, name, category, is_default)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn instruments_update(
    app_handle: AppHandle,
    id: i32,
    name: String,
    category: Option<String>,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(instruments::update(db, id, name, category)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn instruments_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(instruments::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
