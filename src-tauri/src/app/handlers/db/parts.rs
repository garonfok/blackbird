use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::parts;

#[command]
pub fn parts_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(parts::get_all(db)));
    match result {
        Ok(parts) => Ok(parts),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn parts_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(parts::get_by_id(db, id)));
    match result {
        Ok(part) => Ok(part),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn parts_add(
    app_handle: AppHandle,
    name: String,
    path: Option<String>,
    piece_id: i32,
) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(parts::add(db, name, path, piece_id)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn parts_update(
    app_handle: AppHandle,
    id: i32,
    name: String,
    path: Option<String>,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(parts::update(db, id, name, path)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn parts_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(parts::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn parts_set_instruments(
    app_handle: AppHandle,
    part_id: i32,
    instrument_ids: Vec<i32>,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(parts::set_instruments(db, part_id, instrument_ids)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
