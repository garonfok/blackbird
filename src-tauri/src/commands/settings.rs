use crate::settings::SETTINGS;

use tauri::command;

#[command]
pub async fn get_working_directory() -> String {
    SETTINGS.read().unwrap().working_directory().to_string()
}

#[command]
pub async fn set_working_directory(path: String) {
    SETTINGS.write().unwrap().set_working_directory(path);
}
