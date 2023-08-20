use sea_orm::{
    ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};

use crate::entities::{ensemble_parts_instruments, ensembles, ensembles_parts, instruments};

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let ensembles = ensembles::Entity::find().into_json().all(db).await?;
    Ok(ensembles)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let ensemble = ensembles::Entity::find_by_id(id).one(db).await?;

    match ensemble {
        Some(ensemble) => {
            let parts = get_parts(db, id).await?;

            let ensemble = serde_json::json!({
                "id": ensemble.id,
                "name": ensemble.name,
                "category": ensemble.category,
                "created_at": ensemble.created_at,
                "updated_at": ensemble.updated_at,
                "parts": parts,
            });

            Ok(ensemble)
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
            ensemble.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());

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

async fn get_parts(db: &DatabaseConnection, id: i32) -> Result<Vec<Value>, DbErr> {
    let parts = ensembles_parts::Entity::find()
        .filter(ensembles_parts::Column::EnsembleId.eq(id))
        .all(db)
        .await?;

    let mut parts_with_instruments: Vec<Value> = vec![];

    for part in &parts {
        let part_id = part.id;
        let instruments = instruments::Entity::find()
            .join_rev(
                JoinType::InnerJoin,
                ensemble_parts_instruments::Relation::Instruments.def(),
            )
            .filter(ensemble_parts_instruments::Column::PartId.eq(part_id))
            .into_json()
            .all(db)
            .await?;

        let part = serde_json::json!({
            "id": part.id,
            "name": part.name,
            "instruments": instruments,
            "created_at": part.created_at,
            "updated_at": part.updated_at
        });

        parts_with_instruments.push(part);
    }

    Ok(parts_with_instruments)
}
