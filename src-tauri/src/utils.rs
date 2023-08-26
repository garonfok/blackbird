use directories::ProjectDirs;
use std::path::PathBuf;

pub fn data_dir() -> PathBuf {
    let project_dir = ProjectDirs::from("com", "blackbird", "blackbird").unwrap();

    project_dir.data_dir().to_path_buf()
}

pub fn home_dir() -> PathBuf {
    let home_dir = home::home_dir().unwrap();

    home_dir
}
