use crate::settings::AppSettings;

use tauri::command;

#[command]
pub async fn get_working_directory() -> String {
    AppSettings::read().working_directory
}

#[command]
pub async fn set_working_directory(path: String) {
    AppSettings::read()
        .amend(serde_json::json!({
            "working_directory": path
        }))
        .write();
}
