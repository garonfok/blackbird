use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::ensembles;

#[command]
pub fn ensembles_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(ensembles::get_all(db)));
    match result {
        Ok(ensembles) => Ok(ensembles),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensembles_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(ensembles::get_by_id(db, id)));
    match result {
        Ok(ensemble) => Ok(ensemble),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensembles_add(app_handle: AppHandle, name: String, category: Option<String>) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(ensembles::add(db, name, category)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensembles_update(app_handle: AppHandle, id: i32, name: String, category: Option<String>) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(ensembles::update(db, id, name, category)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensembles_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(ensembles::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensembles_add_instrument(
    app_handle: AppHandle,
    ensemble_id: i32,
    instrument_id: i32,
    name: String,
) -> Result<(), String> {
    let result = app_handle.db(|db| {
        block_on(ensembles::add_instrument(
            db,
            ensemble_id,
            instrument_id,
            name,
        ))
    });
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
