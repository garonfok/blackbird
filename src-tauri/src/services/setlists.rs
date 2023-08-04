use sea_orm::{
    ActiveValue, ColumnTrait, DatabaseConnection, DbErr, EntityTrait, JoinType, QueryFilter,
    QuerySelect, RelationTrait,
};

use crate::entities::{pieces_setlists, setlists, pieces};

use serde_json::Value;

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let setlists = setlists::Entity::find().into_json().all(db).await?;
    Ok(setlists)
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let setlist = setlists::Entity::find_by_id(id).one(db).await?;

    match setlist {
        Some(setlist) => {
            let pieces = pieces::Entity::find()
                .join_rev(JoinType::InnerJoin, pieces_setlists::Relation::Pieces.def())
                .filter(pieces_setlists::Column::SetlistId.eq(id))
                .into_json()
                .all(db)
                .await?;

            let setlist = serde_json::json!({
                "id": setlist.id,
                "name": setlist.name,
                "created_at": setlist.created_at,
                "updated_at": setlist.updated_at,
                "pieces": pieces
            });

            Ok(setlist)
        }
        None => {
            return Err(DbErr::RecordNotFound(format!(
                "Setlist with id {} not found",
                id
            )));
        }
    }
}

pub async fn add(db: &DatabaseConnection, name: String) -> Result<i32, DbErr> {
    let active_tag = setlists::ActiveModel {
        name: ActiveValue::Set(name),
        ..Default::default()
    };

    let setlist = setlists::Entity::insert(active_tag).exec(db).await?;
    Ok(setlist.last_insert_id)
}

pub async fn update(db: &DatabaseConnection, id: i32, name: String) -> Result<(), DbErr> {
    let setlist = setlists::Entity::find_by_id(id).one(db).await?;
    match setlist {
        Some(setlist) => {
            let mut setlist: setlists::ActiveModel = setlist.into();

            setlist.name = ActiveValue::Set(name);
            setlist.updated_at = ActiveValue::Set(chrono::offset::Local::now().to_string());

            let _result = setlists::Entity::update(setlist).exec(db).await?;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Setlist with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    setlists::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}
