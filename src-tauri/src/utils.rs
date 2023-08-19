use directories::ProjectDirs;

pub fn data_dir() -> String {
    let project_dir = ProjectDirs::from("com", "blackbird", "blackbird").unwrap();

    project_dir.data_dir().to_str().unwrap().to_string()
}

pub fn home_dir() -> String {
    let home_dir = home::home_dir().unwrap();

    home_dir.to_str().unwrap().to_string()
}
