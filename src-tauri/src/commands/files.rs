use std::fs;
use std::path::PathBuf;
use std::process::Command;

use tauri::command;

use crate::utils;

#[command]
pub fn open_dir(string_path: String) -> Result<(), String> {
    let path = PathBuf::from(string_path);

    Command::new(if utils::is_macos() {
        "open"
    } else {
        "explorer"
    })
    .arg(&path)
    .spawn()
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
pub fn delete_dir(string_path: String) -> Result<(), String> {
    let path = PathBuf::from(string_path);
    fs::remove_dir_all(&path).map_err(|e| e.to_string())
}
