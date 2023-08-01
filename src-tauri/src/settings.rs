use std::error::Error;
use std::fmt::{Display, Formatter};
use std::sync::RwLock;

use serde::{Deserialize, Serialize};

use crate::utils;

lazy_static! {
    pub static ref SETTINGS: RwLock<Settings> = RwLock::new(Settings::default());
}

#[derive(Debug)]
pub struct SettingsError {
    message: String,
}

impl SettingsError {
    pub fn new(message: String) -> Self {
        SettingsError { message }
    }
}

impl Display for SettingsError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        write!(f, "Settings Error: {}", self.message)
    }
}

impl Error for SettingsError {
    fn description(&self) -> &str {
        &self.message
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Settings {
    pub working_directory: String,
    pub open_on_startup: bool,
}

impl Settings {
    pub fn working_directory(&self) -> &str {
        &self.working_directory
    }

    pub fn open_on_startup(&self) -> bool {
        self.open_on_startup
    }
}

impl Settings {
    pub fn set_working_directory(&mut self, path: String) {
        self.working_directory = path;
        self.store();
    }

    pub fn set_open_on_startup(&mut self, open_on_startup: bool) {
        self.open_on_startup = open_on_startup;
        self.store();
    }
}

const SETTINGS_FILE: &'static str = "/settings.json";

impl Settings {
    fn store(&self) {
        let path = Settings::build_conf_path();
        let contents = serde_json::to_string_pretty(self).unwrap();
        let _ = std::fs::write(path, contents);
    }

    fn load() -> std::result::Result<Settings, Box<dyn Error>> {
        let path = Settings::build_conf_path();
        let string = std::fs::read_to_string(path)?;
        serde_json::from_str(&string).map_err(|x| x.to_string().into())
    }

    fn build_conf_path() -> String {
        let path = format!("{}{}", utils::data_dir(), SETTINGS_FILE);
        path
    }
}

const LIBRARY_NAME: &'static str = "/Sheet Music Library";

impl Default for Settings {
    fn default() -> Self {
        Settings::load().unwrap_or_else(|_| {
            let settings = Settings {
                working_directory: format!("{}{}", utils::home_dir(), LIBRARY_NAME),
                open_on_startup: false,
            };
            settings.store();
            settings
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_settings() {
        let settings = Settings::default();

        assert_eq!(
            settings.working_directory,
            format!("{}{}", utils::home_dir(), LIBRARY_NAME)
        );
        assert_eq!(settings.open_on_startup, false);
    }

    #[test]
    fn test_set_working_directory() {
        let mut settings = Settings::default();

        settings.set_working_directory("test".to_string());

        assert_eq!(settings.working_directory, "test");
    }

    #[test]
    fn test_set_open_on_startup() {
        let mut settings = Settings::default();

        settings.set_open_on_startup(true);

        assert_eq!(settings.open_on_startup, true);
    }

    #[test]
    fn test_store() {
        let mut settings = Settings::default();

        settings.set_working_directory("test".to_string());
        settings.set_open_on_startup(true);

        assert_eq!(settings.working_directory, "test");
        assert_eq!(settings.open_on_startup, true);
    }
}