use std::fs;
use std::path::PathBuf;
use tauri::command;

#[command]
pub fn get_database_exists(path: String) -> Result<bool, String> {
    // check if database.db exists in dirPath
    let path = PathBuf::from(path);
    let db_path = path.join("database.db");

    match db_path.exists() {
        true => Ok(true),
        false => Ok(false),
    }
}

#[command]
pub fn get_dir_empty(path: String) -> Result<bool, String> {
    let path = PathBuf::from(path);

    let files = fs::read_dir(path).unwrap();
    for file in files {
        let file = file.unwrap();
        let file_name = file.file_name();
        let file_name = file_name.to_str().unwrap();
        if file_name != ".DS_Store" {
            return Ok(false);
        }
    }

    Ok(true)
}
