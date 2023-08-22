use sea_orm::{ActiveValue, DatabaseConnection, DbErr, EntityTrait};

use crate::entities::scores;

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let scores = scores::Entity::find().into_json().all(db).await?;

    Ok(scores)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let score = scores::Entity::find_by_id(id).into_json().one(db).await?;

    match score {
        Some(score) => Ok(score),
        None => {
            return Err(DbErr::RecordNotFound(format!(
                "Score with id {} not found",
                id
            )))
        }
    }
}

pub async fn add(
    db: &DatabaseConnection,
    name: String,
    path: Option<String>,
    piece_id: i32,
) -> Result<i32, DbErr> {
    let active_score = scores::ActiveModel {
        name: ActiveValue::Set(name),
        path: ActiveValue::Set(path),
        piece_id: ActiveValue::Set(piece_id),
        ..Default::default()
    };

    let score = scores::Entity::insert(active_score).exec(db).await?;

    Ok(score.last_insert_id)
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    name: String,
    path: Option<String>,
) -> Result<(), DbErr> {
    let score = scores::Entity::find_by_id(id).one(db).await?;
    match score {
        Some(score) => {
            let mut score: scores::ActiveModel = score.into();

            score.name = ActiveValue::Set(name);
            score.path = ActiveValue::Set(path);
            score.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());

            let _result = scores::Entity::update(score).exec(db).await?;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Score with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    scores::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}
