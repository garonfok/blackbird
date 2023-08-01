use sea_orm::{
    ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};

use crate::entities::{ensembles, ensembles_instruments, instruments};

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let ensembles = ensembles::Entity::find().into_json().all(db).await?;
    Ok(ensembles)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let ensemble = ensembles::Entity::find_by_id(id).one(db).await?;

    match ensemble {
        Some(ensemble) => {
            let instruments = instruments::Entity::find()
                .join_rev(
                    JoinType::InnerJoin,
                    ensembles_instruments::Relation::Instruments.def(),
                )
                .filter(ensembles_instruments::Column::EnsembleId.eq(id))
                .into_json()
                .all(db)
                .await?;

            let ensemble_with_instruments = serde_json::json!({
                "id": ensemble.id,
                "name": ensemble.name,
                "created_at": ensemble.created_at,
                "updated_at": ensemble.updated_at,
                "instruments": instruments,
            });

            Ok(ensemble_with_instruments)
        }
        None => {
            return Err(DbErr::RecordNotFound(format!(
                "Ensemble with id {} not found",
                id
            )));
        }
    }
}

pub async fn add(
    db: &DatabaseConnection,
    name: String,
    category: Option<String>,
) -> Result<i32, DbErr> {
    let active_ensemble = ensembles::ActiveModel {
        name: ActiveValue::Set(name),
        category: ActiveValue::Set(category),
        ..Default::default()
    };

    let ensemble = ensembles::Entity::insert(active_ensemble).exec(db).await?;
    Ok(ensemble.last_insert_id)
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    name: String,
    category: Option<String>,
) -> Result<(), DbErr> {
    let ensemble = ensembles::Entity::find_by_id(id).one(db).await?;
    match ensemble {
        Some(ensemble) => {
            let mut ensemble: ensembles::ActiveModel = ensemble.into();

            ensemble.name = ActiveValue::Set(name);
            ensemble.category = ActiveValue::Set(category);
            ensemble.updated_at = ActiveValue::Set(chrono::Utc::now().naive_utc().to_string());

            let _result = ensembles::Entity::update(ensemble).exec(db).await?;
            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Ensemble with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    ensembles::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}

pub async fn add_instrument(
    db: &DatabaseConnection,
    ensemble_id: i32,
    instrument_id: i32,
    name: String,
) -> Result<(), DbErr> {
    let ensemble = ensembles::Entity::find_by_id(ensemble_id).one(db).await?;
    match ensemble {
        Some(ensemble) => {
            let active_ensemble_instrument = ensembles_instruments::ActiveModel {
                ensemble_id: ActiveValue::Set(ensemble_id),
                instrument_id: ActiveValue::Set(instrument_id),
                name: ActiveValue::Set(name),
                ..Default::default()
            };

            let result = ensembles_instruments::Entity::insert(active_ensemble_instrument)
                .exec(db)
                .await;

            if result.is_err() {
                return Err(result.unwrap_err());
            }

            let mut ensemble: ensembles::ActiveModel = ensemble.into();

            ensemble.updated_at = ActiveValue::Set(chrono::Utc::now().naive_utc().to_string());
            ensembles::Entity::update(ensemble).exec(db).await?;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Ensemble with id {} not found",
            ensemble_id
        ))),
    }
}

// generate test for add_instruments
#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init;

    #[tokio::test]
    async fn test_add_instruments() {
        let db = init().await.unwrap();
        let add_ensemble_result = add(&db, String::from("test ensemble"), None).await;

        assert!(add_ensemble_result.is_ok());

        let ensemble_id = add_ensemble_result.unwrap();

        let add_instrument_result =
            crate::services::instruments::add(&db, String::from("test instrument 1"), false).await;
        assert!(add_instrument_result.is_ok());
        let add_instrument_result =
            crate::services::instruments::add(&db, String::from("test instrument 2"), false).await;
        assert!(add_instrument_result.is_ok());

        let instrument_ids = vec![1, 2];
        let result = add_instrument(
            &db,
            ensemble_id,
            instrument_ids[0],
            String::from("test part 1"),
        )
        .await;
        assert!(result.is_ok());
        let result = add_instrument(
            &db,
            ensemble_id,
            instrument_ids[1],
            String::from("test part 2"),
        )
        .await;
        assert!(result.is_ok());

        let get_ensemble_result = get_by_id(&db, ensemble_id).await;
        assert!(get_ensemble_result.is_ok());
        let ensemble = get_ensemble_result.unwrap();
        assert!(ensemble["instruments"].as_array().unwrap().len() == 2);

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }
}
