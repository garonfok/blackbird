use crate::db;
use crate::state::AppState;
use futures::executor::block_on;
use tauri::{App, Manager, State};

pub fn init(app: &mut App) -> Result<(), Box<dyn std::error::Error>> {
    let handle = app.handle();
    let app_state: State<AppState> = handle.state();
    let db = block_on(db::init()).unwrap();

    *app_state.db.lock().unwrap() = Some(db);
    Ok(())
}
