use tauri::{command, AppHandle};

use futures::executor::block_on;

use crate::state::ServiceAccess;

use crate::services::ensemble_parts;

#[command]
pub fn ensemble_parts_get_by_id(
    app_handle: AppHandle,
    id: i32,
) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(ensemble_parts::get_by_id(db, id)));
    match result {
        Ok(ensemble_part) => Ok(ensemble_part),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensemble_parts_add(
    app_handle: AppHandle,
    name: String,
    ensemble_id: i32,
) -> Result<i32, String> {
    let result = app_handle.db(|db| block_on(ensemble_parts::add(db, name, ensemble_id)));
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensemble_parts_update(app_handle: AppHandle, id: i32, name: String) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(ensemble_parts::update(db, id, name)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensemble_parts_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(ensemble_parts::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn ensemble_parts_set_instruments(
    app_handle: AppHandle,
    ensemble_part_id: i32,
    instrument_ids: Vec<i32>,
) -> Result<(), String> {
    let result = app_handle.db(|db| {
        block_on(ensemble_parts::set_instruments(
            db,
            ensemble_part_id,
            instrument_ids,
        ))
    });
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
