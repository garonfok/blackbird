// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use state::AppState;
use tauri::Manager;
use tauri_plugin_autostart::MacosLauncher;

mod app;
mod db;
mod entities;
mod migrator;
mod services;
mod settings;
mod state;
mod utils;

use app::{handlers, menu, setup};

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

#[tokio::main]
async fn main() {
    let builder = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);

            app.emit_all("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            Some(vec!["--flag1", "--flag2"]),
        ))
        .manage(AppState {
            db: Default::default(),
        })
        .invoke_handler(handlers::init())
        .setup(setup::init)
        .menu(menu::init());

    builder
        .on_menu_event(menu::menu_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
