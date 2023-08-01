use crate::settings::SETTINGS;

use tauri::command;

#[command]
pub async fn get_working_directory() -> String {
    SETTINGS.read().unwrap().working_directory().to_string()
}

#[command]
pub async fn get_open_on_startup() -> bool {
    SETTINGS.read().unwrap().open_on_startup()
}

#[command]
pub async fn set_working_directory(path: String) {
    SETTINGS.write().unwrap().set_working_directory(path);
}

#[command]
pub async fn set_open_on_startup(open_on_startup: bool) {
    SETTINGS
        .write()
        .unwrap()
        .set_open_on_startup(open_on_startup);
}
