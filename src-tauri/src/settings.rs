use crate::utils;
use std::{collections::BTreeMap, path::PathBuf};

use serde_json::Value;
#[cfg(target_os = "macos")]

const LIBRARY_NAME: &str = "Sheet Music Library";
const SETTINGS_FILE: &str = "settings.json";

macro_rules! pub_struct {
  ($name:ident {$($field:ident : $t:ty,)*}) => {
    #[derive(serde::Serialize, serde::Deserialize, Debug, Clone)]
    pub struct $name {
      $(pub $field: $t,)*
    }
  }
}

pub_struct!(AppSettings {
    hide_dock_icon: bool,
    // auto update: prompt / silent/ disable
    auto_update: String,
    stay_on_top: bool,

    working_directory: String,
});

impl AppSettings {
    pub fn new() -> Self {
        println!("settings_init");
        let default_path = utils::home_dir().join(LIBRARY_NAME);
        Self {
            hide_dock_icon: cfg!(target_os = "macos"),
            auto_update: "prompt".into(),
            stay_on_top: false,
            working_directory: default_path.to_str().unwrap().into(),
        }
    }

    pub fn file_path() -> PathBuf {
        utils::data_dir().join(SETTINGS_FILE)
    }

    pub fn read() -> Self {
        match std::fs::read_to_string(Self::file_path()) {
            Ok(settings) => {
                if let Ok(string2) = serde_json::from_str::<AppSettings>(&settings) {
                    string2
                } else {
                    println!("settings_read_parse_error");
                    Self::default()
                }
            }
            Err(err) => {
                println!("settings_read_error: {}", err);
                Self::default()
            }
        }
    }

    pub fn write(self) -> Self {
        let path = &Self::file_path();
        if !utils::exists(path) {
            utils::create_file(path).unwrap();
            println!("settings_create");
        }
        if let Ok(settings) = serde_json::to_string_pretty(&self) {
            std::fs::write(path, settings).unwrap_or_else(|err| {
                println!("settings_write_error: {}", err);
                Self::default().write();
            });
        } else {
            println!("settings_write_parse_error");
        }
        self
    }

    pub fn amend(self, json: Value) -> Self {
        let val = serde_json::to_value(&self).unwrap();
        let mut config: BTreeMap<String, Value> = serde_json::from_value(val).unwrap();
        let new_json: BTreeMap<String, Value> = serde_json::from_value(json).unwrap();

        for (key, value) in new_json {
            config.insert(key, value);
        }

        match serde_json::to_string_pretty(&config) {
            Ok(v) => match serde_json::from_str::<AppSettings>(&v) {
                Ok(v) => v,
                Err(err) => {
                    println!("conf_amend_parse: {}", err);
                    self
                }
            },
            Err(err) => {
                println!("conf_amend_str: {}", err);
                self
            }
        }
    }
}

impl Default for AppSettings {
    fn default() -> Self {
        Self::new()
    }
}
