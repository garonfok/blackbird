use sea_orm::{
    ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, QueryFilter,
};

use crate::entities::instruments;

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let instruments = instruments::Entity::find().into_json().all(db).await?;

    Ok(instruments)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let instrument = instruments::Entity::find_by_id(id)
        .into_json()
        .one(db)
        .await?;
    match instrument {
        Some(instrument) => Ok(instrument),
        None => Err(DbErr::RecordNotFound(format!(
            "Instrument with id {} not found",
            id
        ))),
    }
}

pub async fn add(
    db: &DatabaseConnection,
    name: String,
    category: Option<String>,
    is_default: bool,
) -> Result<i32, DbErr> {
    let instrument = instruments::Entity::find()
        .filter(instruments::Column::Name.eq(&name))
        .into_json()
        .one(db)
        .await?;

    if instrument.is_some() {
        return Err(DbErr::Query(sea_orm::RuntimeErr::Internal(String::from(
            format!("Instrument with name {} already exists", name),
        ))));
    }

    let active_instrument = instruments::ActiveModel {
        name: ActiveValue::Set(name),
        category: ActiveValue::Set(category),
        is_default: ActiveValue::Set(is_default),
        ..Default::default()
    };

    let instrument = instruments::Entity::insert(active_instrument)
        .exec(db)
        .await?;

    Ok(instrument.last_insert_id)
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    name: String,
    category: Option<String>,
) -> Result<(), DbErr> {
    let instrument = instruments::Entity::find_by_id(id).one(db).await?;
    match instrument {
        Some(instrument) => {
            if instrument.is_default {
                return Err(DbErr::Query(sea_orm::RuntimeErr::Internal(String::from(
                    format!(
                        "Cannot update instrument with id {} because it is a default",
                        id
                    ),
                ))));
            }
            let mut instrument: instruments::ActiveModel = instrument.into();

            instrument.name = ActiveValue::Set(name);
            instrument.category = ActiveValue::Set(category);
            instrument.updated_at = ActiveValue::Set(chrono::offset::Local::now().to_string());

            let result = instruments::Entity::update(instrument).exec(db).await;

            match result {
                Ok(_) => Ok(()),
                Err(e) => Err(e),
            }
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Instrument with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    instruments::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init;

    #[tokio::test]
    async fn test_get_all() {
        let db = init().await.unwrap();
        let result = get_all(&db).await;

        assert!(result.is_ok());

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    #[tokio::test]
    async fn test_add() {
        let db = init().await.unwrap();
        let add_result1 = add(&db, String::from("Bassoon"), None, false).await;
        assert!(add_result1.is_ok());
        let add_result2 = add(&db, String::from("Bassoon"), None, false).await;
        assert!(add_result2.is_err());
        let instrument_id = add_result1.unwrap();
        let get_result = get_by_id(&db, instrument_id).await;
        assert!(get_result.is_ok());
        let instrument = get_result.unwrap();
        assert_eq!(instrument["name"], "Bassoon");

        println!("{:#}", instrument);

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    // Test to update a default instrument
    #[tokio::test]
    async fn test_update_default_instrument() {
        let db = init().await.unwrap();
        let result = add(&db, String::from("Bassoon"), None, true).await;
        assert!(result.is_ok());

        let id = result.unwrap();

        let result = update(&db, id, String::from("Contrabassoon"), None).await;
        assert!(result.is_err());

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    #[tokio::test]
    async fn test_update_nondefault_instrument() {
        let db = init().await.unwrap();
        let result = add(&db, String::from("Bassoon"), None, false).await;
        assert!(result.is_ok());

        let id = result.unwrap();

        let result = update(&db, id, String::from("Contrabassoon"), None).await;
        assert!(result.is_ok());

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    #[tokio::test]
    async fn test_update_nonexistent_record() {
        let db = init().await.unwrap();
        let result = update(&db, 1, String::from("Contrabassoon"), None).await;
        assert!(result.is_err());

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }
}
