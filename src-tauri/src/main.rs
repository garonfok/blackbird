// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use futures::executor::block_on;
use state::AppState;
use tauri::{Manager, State};
use tauri_plugin_autostart::MacosLauncher;

mod commands;
mod db;
mod entities;
mod menu;
mod migrator;
mod services;
mod settings;
mod state;
mod utils;

#[macro_use]
extern crate lazy_static;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

#[tokio::main]
async fn main() {
    if let Err(e) = block_on(db::init()) {
        println!("Error: {}", e);
    }

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
        .invoke_handler(commands::init())
        .setup(|app| {
            let handle = app.handle();
            let app_state: State<AppState> = handle.state();
            let db = block_on(db::init()).unwrap();

            *app_state.db.lock().unwrap() = Some(db);
            Ok(())
        })
        .menu(menu::init());

    builder
        .on_menu_event(menu::menu_handler)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
