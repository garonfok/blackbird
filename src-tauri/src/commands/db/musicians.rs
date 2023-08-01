use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::musicians;

#[command]
pub fn musicians_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(musicians::get_all(db)));
    match result {
        Ok(musicians) => Ok(musicians),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn musicians_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(musicians::get_by_id(db, id)));
    match result {
        Ok(musician) => Ok(musician),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn musicians_add(
    app_handle: AppHandle,
    first_name: String,
    last_name: Option<String>,
) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(musicians::add(db, first_name, last_name)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn musicians_update(
    app_handle: AppHandle,
    id: i32,
    first_name: String,
    last_name: Option<String>,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(musicians::update(db, id, first_name, last_name)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn musicians_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(musicians::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
