use directories::ProjectDirs;
use eyre::Result;
use std::{
    fs,
    path::{Path, PathBuf},
};

pub fn data_dir() -> PathBuf {
    let project_dir = ProjectDirs::from("com", "blackbird", "blackbird").unwrap();

    project_dir.data_dir().to_path_buf()
}

pub fn home_dir() -> PathBuf {
    let home_dir = home::home_dir().unwrap();

    home_dir
}

pub fn exists(path: &Path) -> bool {
    Path::new(&path).exists()
}

pub fn create_file<P: AsRef<Path>>(filename: P) -> Result<()> {
    let filename = filename.as_ref();
    if let Some(parent) = filename.parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)?;
        }
    }
    fs::File::create(filename)?;
    Ok(())
}
