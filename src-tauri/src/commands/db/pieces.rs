use crate::services::pieces;
use crate::state::ServiceAccess;
use futures::executor::block_on;
use tauri::{command, AppHandle};

#[command]
pub fn pieces_get_all(app_handle: AppHandle) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(pieces::get_all(db)));
    match result {
        Ok(pieces) => Ok(pieces),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_get_by_setlist(
    app_handle: AppHandle,
    setlist_id: i32,
) -> Result<Vec<serde_json::Value>, String> {
    let result = app_handle.db(|db| block_on(pieces::get_by_setlist(db, setlist_id)));
    match result {
        Ok(pieces) => Ok(pieces),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_get_by_id(app_handle: AppHandle, id: i32) -> Result<serde_json::Value, String> {
    let result = app_handle.db(|db| block_on(pieces::get_by_id(db, id)));
    match result {
        Ok(piece) => Ok(piece),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_add(
    app_handle: AppHandle,
    title: String,
    year_published: Option<i32>,
    path: String,
    difficulty: Option<i32>,
    notes: String,
) -> Result<i32, String> {
    let result = app_handle.db(|db| {
        block_on(pieces::add(
            db,
            title,
            year_published,
            path,
            difficulty,
            notes,
        ))
    });
    match result {
        Ok(id) => Ok(id),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_update(
    app_handle: AppHandle,
    id: i32,
    title: String,
    year_published: Option<i32>,
    path: String,
    difficulty: Option<i32>,
    notes: String,
) -> Result<(), String> {
    let result = app_handle.db(|db| {
        block_on(pieces::update(
            db,
            id,
            title,
            year_published,
            path,
            difficulty,
            notes,
        ))
    });
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_delete(app_handle: AppHandle, id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(pieces::delete(db, id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_set_musicians(
    app_handle: AppHandle,
    piece_id: i32,
    musician_ids: Vec<i32>,
    role: String,
) -> Result<(), String> {
    let result =
        app_handle.db(|db| block_on(pieces::set_musicians(db, piece_id, musician_ids, role)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_set_tags(
    app_handle: AppHandle,
    piece_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(pieces::set_tags(db, piece_id, tag_ids)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_drop_scores(app_handle: AppHandle, piece_id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(pieces::drop_scores(db, piece_id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}

#[command]
pub fn pieces_drop_parts(app_handle: AppHandle, piece_id: i32) -> Result<(), String> {
    let result = app_handle.db(|db| block_on(pieces::drop_parts(db, piece_id)));
    match result {
        Ok(_) => Ok(()),
        Err(e) => Err(e.to_string()),
    }
}
