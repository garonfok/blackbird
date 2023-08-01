use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::scores;

#[command]
pub fn scores_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(scores::get_all(db)));
    match result {
        Ok(scores) => Ok(scores),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn scores_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(scores::get_by_id(db, id)));
    match result {
        Ok(score) => Ok(score),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn scores_add(
    app_handle: AppHandle,
    name: String,
    path: Option<String>,
    piece_id: i32,
) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(scores::add(db, name, path, piece_id)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn scores_update(
    app_handle: AppHandle,
    id: i32,
    name: String,
    path: Option<String>,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(scores::update(db, id, name, path)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn scores_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(scores::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
