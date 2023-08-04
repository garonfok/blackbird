use sea_orm::{ActiveValue, DatabaseConnection, DbErr, EntityTrait};

use crate::entities::musicians;

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let musicians = musicians::Entity::find().into_json().all(db).await?;
    Ok(musicians)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let musician = musicians::Entity::find_by_id(id)
        .into_json()
        .one(db)
        .await?;
    match musician {
        Some(musician) => Ok(musician),
        None => Err(DbErr::RecordNotFound(format!(
            "Musician with id {} not found",
            id
        ))),
    }
}

pub async fn add(
    db: &DatabaseConnection,
    first_name: String,
    last_name: Option<String>,
) -> Result<i32, DbErr> {
    let active_musician = musicians::ActiveModel {
        first_name: ActiveValue::Set(first_name),
        last_name: ActiveValue::Set(last_name),
        ..Default::default()
    };

    let musician = musicians::Entity::insert(active_musician).exec(db).await?;
    Ok(musician.last_insert_id)
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    first_name: String,
    last_name: Option<String>,
) -> Result<(), DbErr> {
    let musician = musicians::Entity::find_by_id(id).one(db).await?;
    match musician {
        Some(musician) => {
            let mut musician: musicians::ActiveModel = musician.into();

            musician.first_name = ActiveValue::Set(first_name);
            musician.last_name = ActiveValue::Set(last_name);
            musician.updated_at = ActiveValue::Set(chrono::offset::Local::now().to_string());

            musicians::Entity::update(musician).exec(db).await?;
            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Musician with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    musicians::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}
