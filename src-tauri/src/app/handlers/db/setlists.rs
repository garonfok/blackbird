use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::setlists;

#[command]
pub fn setlists_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(setlists::get_all(db)));
    match result {
        Ok(setlists) => Ok(setlists),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn setlists_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(setlists::get_by_id(db, id)));
    match result {
        Ok(setlist) => Ok(setlist),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn setlists_add(app_handle: AppHandle, name: String) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(setlists::add(db, name)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn setlists_update(app_handle: AppHandle, id: i32, name: String) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(setlists::update(db, id, name)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn setlists_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(setlists::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn setlists_add_piece(
    app_handle: AppHandle,
    setlist_id: i32,
    piece_id: i32,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(setlists::add_piece(db, setlist_id, piece_id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn setlists_remove_piece(
    app_handle: AppHandle,
    setlist_id: i32,
    piece_id: i32,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(setlists::remove_piece(db, setlist_id, piece_id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
