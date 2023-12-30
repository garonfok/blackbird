use tauri::{AboutMetadata, CustomMenuItem, Menu, MenuItem, Submenu, WindowMenuEvent};

pub fn init() -> Menu {
    let name = "Blackbird";

    let app_menu = Submenu::new(
        name,
        Menu::with_items([
            #[cfg(target_os = "macos")]
            MenuItem::About(name.into(), AboutMetadata::default()).into(),
            #[cfg(not(target_os = "macos"))]
            CustomMenuItem::new("about", format!("About {name}")).into(),
            CustomMenuItem::new("check_update", "Check for Updates").into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("settings", "Settings")
                .accelerator("CmdorCtrl+,")
                .into(),
            MenuItem::Separator.into(),
            MenuItem::Services.into(),
            MenuItem::Separator.into(),
            MenuItem::Hide.into(),
            MenuItem::HideOthers.into(),
            MenuItem::ShowAll.into(),
            MenuItem::Separator.into(),
            MenuItem::Quit.into(),
        ]),
    );

    let edit_menu = Submenu::new(
        "Edit",
        Menu::with_items([
            CustomMenuItem::new("undo", "Undo")
                .accelerator("CmdorCtrl+Z")
                .into(),
            CustomMenuItem::new("redo", "Redo")
                .accelerator("CmdorCtrl+Shift+Z")
                .into(),
            MenuItem::Separator.into(),
            MenuItem::Cut.into(),
            MenuItem::Copy.into(),
            MenuItem::Paste.into(),
            MenuItem::SelectAll.into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("search", "Search")
                .accelerator("CmdorCtrl+K")
                .into(),
        ]),
    );

    let view_menu = Submenu::new(
        "View",
        Menu::with_items([
            CustomMenuItem::new("zoom_0", "Zoom to Actual Size")
                .accelerator("CmdOrCtrl+0")
                .into(),
            CustomMenuItem::new("zoom_out", "Zoom Out")
                .accelerator("CmdOrCtrl+-")
                .into(),
            CustomMenuItem::new("zoom_in", "Zoom In")
                .accelerator("CmdOrCtrl+Plus")
                .into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("reload", "Reload")
                .accelerator("CmdOrCtrl+R")
                .into(),
        ]),
    );

    let window_menu = Submenu::new(
        "Window",
        Menu::with_items([
            MenuItem::CloseWindow.into(),
            MenuItem::Minimize.into(),
            MenuItem::Zoom.into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("bring_all_to_front", "Bring All to Front").into(),
        ]),
    );

    let help_menu = Submenu::new(
        "Help",
        Menu::with_items([
            CustomMenuItem::new("learn_more", "Learn More").into(),
            CustomMenuItem::new("documentation", "Documentation").into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("report", "Report an Issue").into(),
        ]),
    );

    Menu::new()
        .add_submenu(app_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(window_menu)
        .add_submenu(help_menu)
}

pub fn menu_handler(event: WindowMenuEvent<tauri::Wry>) {
    let menu_id = event.menu_item_id();
    let win = Some(event.window()).unwrap();

    match menu_id {
        "zoom_0" => win.eval("window.__zoom0 && window.__zoom0()").unwrap(),
        "zoom_out" => win.eval("window.__zoomOut && window.__zoomOut()").unwrap(),
        "zoom_in" => win.eval("window.__zoomIn && window.__zoomIn()").unwrap(),
        "reload" => win.eval("window.location.reload()").unwrap(),
        _ => {
            println!("Unhandled menu event: {}", menu_id);
        }
    }
}
