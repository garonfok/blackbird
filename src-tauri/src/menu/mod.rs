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
                .accelerator("CommandorCtrl+,")
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

    let edit = Submenu::new(
        "Edit",
        Menu::with_items([
            MenuItem::Undo.into(),
            MenuItem::Redo.into(),
            MenuItem::Separator.into(),
            MenuItem::Cut.into(),
            MenuItem::Copy.into(),
            MenuItem::Paste.into(),
            MenuItem::SelectAll.into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("search", "Search")
                .accelerator("CommandorCtrl+K")
                .into(),
        ]),
    );

    let view = Submenu::new("View", Menu::with_items([]));

    let window = Submenu::new(
        "Window",
        Menu::with_items([
            MenuItem::CloseWindow.into(),
            MenuItem::Minimize.into(),
            MenuItem::Zoom.into(),
            MenuItem::Separator.into(),
            CustomMenuItem::new("bring_all_to_front", "Bring All to Front").into(),
        ]),
    );

    let help = Submenu::new(
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
        .add_submenu(edit)
        .add_submenu(view)
        .add_submenu(window)
        .add_submenu(help)
}

pub fn menu_handler(event: WindowMenuEvent<tauri::Wry>) {
    let menu_id = event.menu_item_id();

    match menu_id {
        _ => {
            println!("Unhandled menu event: {}", menu_id);
        }
    }
}
