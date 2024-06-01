use sea_orm::{ActiveValue, DatabaseConnection, DbErr, EntityTrait};

use crate::entities::tags;

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let tags = tags::Entity::find().into_json().all(db).await?;
    Ok(tags)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let tag = tags::Entity::find_by_id(id).into_json().one(db).await?;
    match tag {
        Some(tag) => Ok(tag),
        None => Err(DbErr::RecordNotFound(format!(
            "Tag with id {} not found",
            id
        ))),
    }
}

pub async fn add(db: &DatabaseConnection, name: String) -> Result<i32, DbErr> {
    let active_tag = tags::ActiveModel {
        name: ActiveValue::Set(name),
        ..Default::default()
    };

    let tag = tags::Entity::insert(active_tag).exec(db).await?;
    Ok(tag.last_insert_id)
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    name: String,
) -> Result<(), DbErr> {
    let tag = tags::Entity::find_by_id(id).one(db).await?;
    match tag {
        Some(tag) => {
            let mut tag: tags::ActiveModel = tag.into();

            tag.name = ActiveValue::Set(name);
            tag.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());

            let _result = tags::Entity::update(tag).exec(db).await?;
            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Tag with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    tags::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}
