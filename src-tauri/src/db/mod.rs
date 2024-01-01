use crate::migrator::Migrator;
use crate::settings::AppSettings;
use sea_orm::{Database, DatabaseConnection, DbErr};
use sea_orm_migration::prelude::*;
use sea_orm_migration::SchemaManager;

use std::fs;
use std::path::Path;
use std::path::PathBuf;

mod seed;

pub async fn init() -> Result<DatabaseConnection, DbErr> {
    let mut creating = false;

    if !db_file_exists() {
        create_db_file();
        creating = true;
    }

    let db = establish_connection().await?;
    run_migrations(&db, creating).await?;

    println!("Connected to database");

    Ok(db)
}

async fn establish_connection() -> Result<DatabaseConnection, DbErr> {
    let db_file_path = format!("sqlite://{}", get_db_file_path().to_str().unwrap());
    let db = Database::connect(db_file_path).await?;
    Ok(db)
}

async fn run_migrations(db: &sea_orm::DatabaseConnection, creating: bool) -> Result<(), DbErr> {
    let schema_manager = SchemaManager::new(db);

    if creating {
        Migrator::up(db, None).await?;
        seed::seed(db).await?;
    }

    assert!(schema_manager.has_table("pieces").await?);
    assert!(schema_manager.has_table("parts").await?);
    assert!(schema_manager.has_table("musicians").await?);
    assert!(schema_manager.has_table("instruments").await?);
    assert!(schema_manager.has_table("tags").await?);
    assert!(schema_manager.has_table("ensembles").await?);
    assert!(schema_manager.has_table("pieces_tags").await?);
    assert!(schema_manager.has_table("pieces_musicians").await?);
    assert!(schema_manager.has_table("parts_instruments").await?);
    assert!(schema_manager.has_table("ensembles_parts").await?);
    assert!(
        schema_manager
            .has_table("ensemble_parts_instruments")
            .await?
    );
    Ok(())
}

fn create_db_file() {
    let db_path = get_db_file_path();
    fs::File::create(db_path).unwrap();
}

fn db_file_exists() -> bool {
    let db_path = get_db_file_path();
    db_path.exists()
}

fn get_db_file_path() -> PathBuf {
    let working_directory = AppSettings::read().working_directory;
    if !Path::new(&working_directory).exists() {
        fs::create_dir_all(&working_directory).unwrap();
    }
    Path::new(&working_directory).join("database.db")
}

#[cfg(test)]
mod tests {

    #[tokio::test]
    async fn test_init_db() {
        use super::*;
        let db = init().await.unwrap();

        let _ = db.close().await;
    }
}
