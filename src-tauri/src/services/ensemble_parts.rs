use sea_orm::{
    ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};

use crate::entities::{ensemble_parts_instruments, ensembles_parts, instruments};

use serde_json::Value;

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let part = ensembles_parts::Entity::find_by_id(id).one(db).await?;

    match part {
        Some(part) => {
            let instruments = instruments::Entity::find()
                .join_rev(
                    JoinType::InnerJoin,
                    ensemble_parts_instruments::Relation::Instruments.def(),
                )
                .filter(ensemble_parts_instruments::Column::PartId.eq(id))
                .into_json()
                .all(db)
                .await?;

            let part = serde_json::json!({
                "id": part.id,
                "name": part.name,
                "created_at": part.created_at,
                "updated_at": part.updated_at,
                "instruments": instruments,
            });

            Ok(part)
        }
        None => {
            return Err(DbErr::RecordNotFound(format!(
                "Part with id {} not found",
                id
            )));
        }
    }
}

pub async fn add(db: &DatabaseConnection, name: String, ensemble_id: i32) -> Result<i32, DbErr> {
    let active_part = ensembles_parts::ActiveModel {
        name: ActiveValue::Set(name),
        ensemble_id: ActiveValue::Set(ensemble_id),
        ..Default::default()
    };

    let part = ensembles_parts::Entity::insert(active_part)
        .exec(db)
        .await?;
    Ok(part.last_insert_id)
}

pub async fn update(db: &DatabaseConnection, id: i32, name: String) -> Result<(), DbErr> {
    let part = ensembles_parts::Entity::find_by_id(id).one(db).await?;
    match part {
        Some(part) => {
            let mut part: ensembles_parts::ActiveModel = part.into();

            part.name = ActiveValue::Set(name);
            part.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());

            ensembles_parts::Entity::update(part).exec(db).await?;
            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Part with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    ensembles_parts::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}

pub async fn set_instruments(
    db: &DatabaseConnection,
    part_id: i32,
    instrument_ids: Vec<i32>,
) -> Result<(), DbErr> {
    let part = ensembles_parts::Entity::find_by_id(part_id).one(db).await?;
    match part {
        Some(part) => {
            ensemble_parts_instruments::Entity::delete_many()
                .filter(ensemble_parts_instruments::Column::PartId.eq(part_id))
                .exec(db)
                .await?;

            for instrument_id in &instrument_ids {
                let active_part_instrument = ensemble_parts_instruments::ActiveModel {
                    part_id: ActiveValue::Set(part_id),
                    instrument_id: ActiveValue::Set(*instrument_id),
                    ..Default::default()
                };

                ensemble_parts_instruments::Entity::insert(active_part_instrument)
                    .exec(db)
                    .await?;
            }

            let mut part: ensembles_parts::ActiveModel = part.into();
            part.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());
            ensembles_parts::Entity::update(part).exec(db).await?;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Part with id {} not found",
            part_id
        ))),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init;
    use crate::services::ensembles::add as add_ensemble;
    use crate::services::ensembles::get_by_id as get_id_ensemble;

    #[tokio::test]
    async fn test_create_ensemble() {
        let db_result = init().await;
        assert!(db_result.is_ok());
        let db = db_result.unwrap();

        let _ = db.close().await;
    }

    #[tokio::test]
    async fn test_time_stamp() {
        let db_result = init().await;
        let db = db_result.unwrap();

        let ensemble_id = add_ensemble(
            &db,
            String::from("test"),
            Some(String::from("test category")),
        )
        .await
        .unwrap();

        let instrument_result = crate::services::instruments::add(
            &db,
            String::from("flute"),
            Some(String::from("woodwind")),
            false,
        )
        .await;
        assert!(instrument_result.is_ok());
        println!("instrument_result: {:#?}", instrument_result);

        let instrument_id = instrument_result.unwrap();

        let part_result = add(&db, String::from("test part"), ensemble_id).await;
        assert!(part_result.is_ok());
        let part_id = part_result.unwrap();
        let part_add_result = set_instruments(&db, part_id, vec![instrument_id]).await;
        assert!(part_add_result.is_ok());

        let ensemble_result = get_id_ensemble(&db, ensemble_id).await;
        println!("ensemble_result: {:#?}", ensemble_result);
        assert!(ensemble_result.is_ok());
        let ensemble = ensemble_result.unwrap();
        println!("ensemble: {:#?}", ensemble);

        let _ = db.close().await;
    }
}
