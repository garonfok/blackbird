use sea_orm::{
    ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};

use crate::entities::{instruments, parts, parts_instruments};

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let parts = parts::Entity::find().into_json().all(db).await?;
    Ok(parts)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let part = parts::Entity::find_by_id(id).one(db).await?;

    match part {
        Some(part) => {
            let instruments = instruments::Entity::find()
                .join_rev(
                    JoinType::InnerJoin,
                    parts_instruments::Relation::Instruments.def(),
                )
                .filter(parts_instruments::Column::PartId.eq(id))
                .into_json()
                .all(db)
                .await?;

            let part = serde_json::json!({
                "id": part.id,
                "name": part.name,
                "path": part.path,
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

pub async fn add(
    db: &DatabaseConnection,
    name: String,
    path: Option<String>,
    piece_id: i32,
) -> Result<i32, DbErr> {
    let active_part = parts::ActiveModel {
        name: ActiveValue::Set(name),
        path: ActiveValue::Set(path),
        piece_id: ActiveValue::Set(piece_id),
        ..Default::default()
    };

    let part = parts::Entity::insert(active_part).exec(db).await?;
    Ok(part.last_insert_id)
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    name: String,
    path: Option<String>,
) -> Result<(), DbErr> {
    let part = parts::Entity::find_by_id(id).one(db).await?;
    match part {
        Some(part) => {
            let mut part: parts::ActiveModel = part.into();

            part.name = ActiveValue::Set(name);
            part.path = ActiveValue::Set(path);
            part.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());

            parts::Entity::update(part).exec(db).await?;
            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Part with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    parts::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}

pub async fn set_instruments(
    db: &DatabaseConnection,
    part_id: i32,
    instrument_ids: Vec<i32>,
) -> Result<(), DbErr> {
    let part = parts::Entity::find_by_id(part_id).one(db).await?;
    match part {
        Some(part) => {
            parts_instruments::Entity::delete_many()
                .filter(parts_instruments::Column::PartId.eq(part_id))
                .exec(db)
                .await?;

            for instrument_id in &instrument_ids {
                let active_part_instrument = parts_instruments::ActiveModel {
                    part_id: ActiveValue::Set(part_id),
                    instrument_id: ActiveValue::Set(*instrument_id),
                    ..Default::default()
                };

                parts_instruments::Entity::insert(active_part_instrument)
                    .exec(db)
                    .await?;
            }

            let mut part: parts::ActiveModel = part.into();
            part.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());
            parts::Entity::update(part).exec(db).await?;

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

    #[tokio::test]
    async fn test_get_all() {
        let db = init().await.unwrap();

        let add_piece_result = crate::services::pieces::add(
            &db,
            "Test Piece".to_string(),
            Some(2023),
            "test/path".to_string(),
            Some(1),
            "This is a test Piece".to_string(),
        )
        .await;
        assert!(add_piece_result.is_ok());
        let id = add_piece_result.unwrap();

        let add_part_result = add(&db, "Test Part1".to_string(), None, 1).await;
        assert!(add_part_result.is_ok());
        let add_part_result = add(&db, "Test Part2".to_string(), None, 1).await;
        assert!(add_part_result.is_ok());
        let add_part_result = add(&db, "Test Part3".to_string(), None, 1).await;
        assert!(add_part_result.is_ok());

        let get_piece_result = crate::services::pieces::get_by_id(&db, id).await;
        println!("{:?}", get_piece_result);
        assert!(get_piece_result.is_ok());

        let _ = db.close().await;
    }

    // test removing instruments via cascade

    #[tokio::test]
    async fn test_delete_part() {
        let db = init().await.unwrap();

        let add_piece_result = crate::services::pieces::add(
            &db,
            "Test Piece".to_string(),
            Some(2023),
            "test/path".to_string(),
            Some(1),
            "This is a test Piece".to_string(),
        )
        .await;
        assert!(add_piece_result.is_ok());

        let add_part_result = add(&db, "Test Part".to_string(), None, 1).await;
        assert!(add_part_result.is_ok());

        let add_instrument_result =
            crate::services::instruments::add(&db, "Test Instrument".to_string(), None, false)
                .await;
        assert!(add_instrument_result.is_ok());

        // add instrument to part
        let part_id = add_part_result.unwrap();
        let instrument_id = add_instrument_result.unwrap();

        let add_instruments_result = set_instruments(&db, part_id, vec![instrument_id]).await;
        assert!(add_instruments_result.is_ok());

        let part_result = get_by_id(&db, part_id).await;
        assert!(part_result.is_ok());

        // delete piece
        let delete_result = delete(&db, part_id).await;
        assert!(delete_result.is_ok());

        let _ = db.close().await;
    }
}
