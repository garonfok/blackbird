use tauri::{command, AppHandle, Manager};

#[command]
pub async fn open_wizard(app_handle: AppHandle, piece_id: Option<i32>) {
    let app_url = if let Some(piece_id) = piece_id {
        format!("/wizard?piece_id={}", piece_id)
    } else {
        "/wizard".to_string()
    };

    tauri::WindowBuilder::new(&app_handle, "wizard", tauri::WindowUrl::App(app_url.into()))
        .title("Wizard")
        .maximizable(true)
        .min_inner_size(800.0, 600.0)
        .build()
        .unwrap();
}

#[tauri::command]
pub fn close_window(app_handle: tauri::AppHandle, window_label: String) {
    app_handle
        .get_window(&window_label)
        .unwrap()
        .close()
        .unwrap();
}
