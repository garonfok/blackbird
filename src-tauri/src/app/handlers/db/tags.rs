use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::tags;

#[command]
pub fn tags_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(tags::get_all(db)));
    match result {
        Ok(tags) => Ok(tags),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn tags_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(tags::get_by_id(db, id)));
    match result {
        Ok(tag) => Ok(tag),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn tags_add(app_handle: AppHandle, name: String) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(tags::add(db, name, String::from("#ffffff"))));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn tags_update(
    app_handle: AppHandle,
    id: i32,
    name: String,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(tags::update(db, id, name, String::from("#ffffff"))));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn tags_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(tags::delete(db, id)));

    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
