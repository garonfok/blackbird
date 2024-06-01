use crate::entities::*;
use sea_orm::{
    ActiveValue, ColumnTrait, Condition, DatabaseConnection, DbBackend, DbErr, EntityTrait,
    JoinType, QueryFilter, QueryOrder, QuerySelect, QueryTrait, RelationTrait,
};
use serde_json::Value;
use std::{fs, path::PathBuf};

pub async fn get_all(db: &DatabaseConnection) -> Result<Vec<Value>, DbErr> {
    let pieces = pieces::Entity::find().all(db).await?;

    let mut pieces_with_data: Vec<Value> = vec![];

    for piece in pieces {
        let id = piece.id;

        let composers = get_musicians(db, id, "composer").await?;
        let arrangers = get_musicians(db, id, "arranger").await?;
        let orchestrators = get_musicians(db, id, "orchestrator").await?;
        let lyricists = get_musicians(db, id, "lyricist").await?;
        let transcribers = get_musicians(db, id, "transcriber").await?;
        let setlists = get_setlists(db, id).await?;
        let tags = get_tags(db, id).await?;
        let scores = get_scores(db, id).await?;
        let parts = get_parts(db, id).await?;

        let piece = serde_json::json!({
            "id": piece.id,
            "title": piece.title,
            "year_published": piece.year_published,
            "path": piece.path,
            "difficulty": piece.difficulty,
            "notes": piece.notes,
            "created_at": piece.created_at,
            "updated_at": piece.updated_at,
            "scores": scores,
            "parts": parts,
            "setlists": setlists,
            "tags": tags,
            "composers": composers,
            "arrangers": arrangers,
            "orchestrators": orchestrators,
            "lyricists": lyricists,
            "transcribers": transcribers,
        });

        pieces_with_data.push(piece);
    }

    Ok(pieces_with_data)
}

pub async fn get_by_setlist(db: &DatabaseConnection, setlist_id: i32) -> Result<Vec<Value>, DbErr> {
    let setlist = setlists::Entity::find_by_id(setlist_id).one(db).await?;
    match setlist {
        Some(_) => {
            let pieces = pieces::Entity::find()
                .join_rev(JoinType::InnerJoin, pieces_setlists::Relation::Pieces.def())
                .filter(pieces_setlists::Column::SetlistId.eq(setlist_id))
                .all(db)
                .await?;

            let mut pieces_with_data: Vec<Value> = vec![];

            for piece in pieces {
                let id = piece.id;

                let composers = get_musicians(db, id, "composer").await?;
                let arrangers = get_musicians(db, id, "arranger").await?;
                let orchestrators = get_musicians(db, id, "orchestrator").await?;
                let lyricists = get_musicians(db, id, "lyricist").await?;
                let transcribers = get_musicians(db, id, "transcriber").await?;
                let setlists = get_setlists(db, id).await?;
                let tags = get_tags(db, id).await?;
                let scores = get_scores(db, id).await?;
                let parts = get_parts(db, id).await?;

                let piece = serde_json::json!({
                    "id": piece.id,
                    "title": piece.title,
                    "year_published": piece.year_published,
                    "path": piece.path,
                    "difficulty": piece.difficulty,
                    "notes": piece.notes,
                    "created_at": piece.created_at,
                    "updated_at": piece.updated_at,
                    "scores": scores,
                    "parts": parts,
                    "setlists": setlists,
                    "tags": tags,
                    "composers": composers,
                    "arrangers": arrangers,
                    "orchestrators": orchestrators,
                    "lyricists": lyricists,
                    "transcribers": transcribers,
                });

                pieces_with_data.push(piece);
            }

            Ok(pieces_with_data)
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Setlist with id {} not found",
            setlist_id
        ))),
    }
}

pub async fn get_by_id(db: &DatabaseConnection, id: i32) -> Result<Value, DbErr> {
    let piece = pieces::Entity::find_by_id(id).one(db).await?;

    match piece {
        Some(piece) => {
            let composers = get_musicians(db, id, "composer").await?;
            let arrangers = get_musicians(db, id, "arranger").await?;
            let orchestrators = get_musicians(db, id, "orchestrator").await?;
            let lyricists = get_musicians(db, id, "lyricist").await?;
            let transcribers = get_musicians(db, id, "transcriber").await?;
            let setlists = get_setlists(db, id).await?;
            let tags = get_tags(db, id).await?;
            let scores = get_scores(db, id).await?;
            let parts = get_parts(db, id).await?;

            let piece = serde_json::json!({
                "id": piece.id,
                "title": piece.title,
                "year_published": piece.year_published,
                "path": piece.path,
                "difficulty": piece.difficulty,
                "notes": piece.notes,
                "created_at": piece.created_at,
                "updated_at": piece.updated_at,
                "scores": scores,
                "parts": parts,
                "setlists": setlists,
                "tags": tags,
                "composers": composers,
                "arrangers": arrangers,
                "orchestrators": orchestrators,
                "lyricists": lyricists,
                "transcribers": transcribers,
            });

            Ok(piece)
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Piece with id {} not found",
            id
        ))),
    }
}

pub async fn add(
    db: &DatabaseConnection,
    title: String,
    year_published: Option<i32>,
    path: String,
    difficulty: Option<i32>,
    notes: String,
) -> Result<i32, DbErr> {
    let active_piece = pieces::ActiveModel {
        title: ActiveValue::Set(title),
        year_published: ActiveValue::Set(year_published),
        path: ActiveValue::Set(path),
        difficulty: ActiveValue::Set(difficulty),
        notes: ActiveValue::Set(notes),
        ..Default::default()
    };

    let result = pieces::Entity::insert(active_piece).exec(db).await;
    match result {
        Ok(result) => {
            let piece_id = result.last_insert_id;
            Ok(piece_id)
        }
        Err(e) => return Err(e),
    }
}

pub async fn update(
    db: &DatabaseConnection,
    id: i32,
    title: String,
    year_published: Option<i32>,
    path: String,
    difficulty: Option<i32>,
    notes: String,
) -> Result<(), DbErr> {
    let piece = pieces::Entity::find_by_id(id).one(db).await?;
    match piece {
        Some(piece) => {
            let mut piece: pieces::ActiveModel = piece.into();

            piece.title = ActiveValue::Set(title);
            piece.year_published = ActiveValue::Set(year_published);
            piece.path = ActiveValue::Set(path);
            piece.difficulty = ActiveValue::Set(difficulty);
            piece.notes = ActiveValue::Set(notes);
            piece.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());

            let _result = pieces::Entity::update(piece).exec(db).await;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Piece with id {} not found",
            id
        ))),
    }
}

pub async fn delete(db: &DatabaseConnection, id: i32) -> Result<(), DbErr> {
    let piece = pieces::Entity::find_by_id(id).one(db).await?;

    let path_string = piece.unwrap().path;

    let path = PathBuf::from(path_string);

    // handle case where path does not exist
    if !path.exists() {
        pieces::Entity::delete_by_id(id).exec(db).await?;
        return Ok(());
    }

    let _ = fs::remove_dir_all(path.clone());
    let path = path.parent().unwrap();

    if path.exists() {
        let files = fs::read_dir(path).unwrap();
        let mut is_empty = true;
        for file in files {
            let file = file.unwrap();
            let file_name = file.file_name();
            let file_name = file_name.to_str().unwrap();
            if file_name != ".DS_Store" {
                is_empty = false;
            }
        }
        if is_empty {
            let _ = fs::remove_dir_all(path);
        }
    }

    pieces::Entity::delete_by_id(id).exec(db).await?;
    Ok(())
}

pub async fn set_tags(
    db: &DatabaseConnection,
    piece_id: i32,
    tag_ids: Vec<i32>,
) -> Result<(), DbErr> {
    let piece = pieces::Entity::find_by_id(piece_id).one(db).await?;
    match piece {
        Some(piece) => {
            pieces_tags::Entity::delete_many()
                .filter(pieces_tags::Column::PieceId.eq(piece_id))
                .exec(db)
                .await?;

            for tag_id in tag_ids {
                let active_piece_tag = pieces_tags::ActiveModel {
                    piece_id: ActiveValue::Set(piece_id),
                    tag_id: ActiveValue::Set(tag_id),
                    ..Default::default()
                };

                pieces_tags::Entity::insert(active_piece_tag)
                    .exec(db)
                    .await?;
            }

            let mut piece: pieces::ActiveModel = piece.into();
            piece.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());
            let _result = pieces::Entity::update(piece).exec(db).await?;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Piece with id {} not found",
            piece_id
        ))),
    }
}

pub async fn set_musicians(
    db: &DatabaseConnection,
    piece_id: i32,
    musician_ids: Vec<i32>,
    role: String,
) -> Result<(), DbErr> {
    let piece = pieces::Entity::find_by_id(piece_id).one(db).await?;
    match piece {
        Some(piece) => {
            pieces_musicians::Entity::delete_many()
                .filter(
                    Condition::all()
                        .add(pieces_musicians::Column::PieceId.eq(piece_id))
                        .add(pieces_musicians::Column::Role.eq(role.clone())),
                )
                .exec(db)
                .await?;

            let mut order = 1;

            for musician_id in musician_ids {
                let active_piece_musician = pieces_musicians::ActiveModel {
                    piece_id: ActiveValue::Set(piece_id),
                    musician_id: ActiveValue::Set(musician_id),
                    role: ActiveValue::Set(role.clone()),
                    order: ActiveValue::Set(order),
                    ..Default::default()
                };

                pieces_musicians::Entity::insert(active_piece_musician)
                    .exec(db)
                    .await?;

                order += 1;
            }

            let mut piece: pieces::ActiveModel = piece.into();
            piece.updated_at = ActiveValue::Set(chrono::Local::now().naive_local().to_string());
            let _result = pieces::Entity::update(piece).exec(db).await?;

            Ok(())
        }
        None => Err(DbErr::RecordNotFound(format!(
            "Piece with id {} not found",
            piece_id
        ))),
    }
}

pub async fn drop_scores(db: &DatabaseConnection, piece_id: i32) -> Result<(), DbErr> {
    scores::Entity::delete_many()
        .filter(scores::Column::PieceId.eq(piece_id))
        .exec(db)
        .await?;

    Ok(())
}

pub async fn drop_parts(db: &DatabaseConnection, piece_id: i32) -> Result<(), DbErr> {
    parts::Entity::delete_many()
        .filter(parts::Column::PieceId.eq(piece_id))
        .exec(db)
        .await?;

    Ok(())
}

async fn get_musicians(db: &DatabaseConnection, id: i32, role: &str) -> Result<Vec<Value>, DbErr> {
    let composers_search_statement = musicians::Entity::find()
        .join_rev(
            JoinType::InnerJoin,
            pieces_musicians::Relation::Musicians.def(),
        )
        .filter(
            Condition::all()
                .add(pieces_musicians::Column::PieceId.eq(id))
                .add(pieces_musicians::Column::Role.eq(role)),
        )
        .order_by_asc(pieces_musicians::Column::Order)
        .build(DbBackend::Sqlite);

    let composers = musicians::Entity::find()
        .from_raw_sql(composers_search_statement)
        .into_json()
        .all(db)
        .await?;

    Ok(composers)
}

async fn get_tags(db: &DatabaseConnection, id: i32) -> Result<Vec<Value>, DbErr> {
    let tags_search_statement = tags::Entity::find()
        .join_rev(JoinType::InnerJoin, pieces_tags::Relation::Tags.def())
        .filter(pieces_tags::Column::PieceId.eq(id))
        .build(DbBackend::Sqlite);

    let tags = tags::Entity::find()
        .from_raw_sql(tags_search_statement)
        .into_json()
        .all(db)
        .await?;

    Ok(tags)
}

async fn get_setlists(db: &DatabaseConnection, id: i32) -> Result<Vec<Value>, DbErr> {
    let setlists_search_statement = setlists::Entity::find()
        .join_rev(
            JoinType::InnerJoin,
            pieces_setlists::Relation::Setlists.def(),
        )
        .filter(pieces_setlists::Column::PieceId.eq(id))
        .build(DbBackend::Sqlite);

    let setlists = setlists::Entity::find()
        .from_raw_sql(setlists_search_statement)
        .into_json()
        .all(db)
        .await?;

    Ok(setlists)
}

async fn get_scores(db: &DatabaseConnection, id: i32) -> Result<Vec<Value>, DbErr> {
    let scores = scores::Entity::find()
        .filter(scores::Column::PieceId.eq(id))
        .into_json()
        .all(db)
        .await?;

    Ok(scores)
}

async fn get_parts(db: &DatabaseConnection, id: i32) -> Result<Vec<Value>, DbErr> {
    let parts = parts::Entity::find()
        .filter(parts::Column::PieceId.eq(id))
        .all(db)
        .await?;

    let mut parts_with_instruments: Vec<Value> = vec![];

    for part in &parts {
        let part_id = part.id;

        let instruments = instruments::Entity::find()
            .join_rev(
                JoinType::InnerJoin,
                parts_instruments::Relation::Instruments.def(),
            )
            .filter(parts_instruments::Column::PartId.eq(part_id))
            .into_json()
            .all(db)
            .await?;

        let part_with_instruments = serde_json::json!({
            "id": part.id,
            "name": part.name,
            "path": part.path,
            "instruments": instruments,
            "created_at": part.created_at,
            "updated_at": part.updated_at
        });

        parts_with_instruments.push(part_with_instruments);
    }

    Ok(parts_with_instruments)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::init;

    #[tokio::test]
    async fn test_add_and_get_piece() {
        let db = init().await.unwrap();
        let add_piece_result = add(
            &db,
            String::from("test piece"),
            Some(2020),
            String::from("test path"),
            None,
            String::from("test notes"),
        )
        .await;
        assert!(add_piece_result.is_ok());

        let piece_id = add_piece_result.unwrap();

        let get_piece_result = get_by_id(&db, piece_id).await;

        assert!(get_piece_result.is_ok());

        let piece = get_piece_result.unwrap();

        assert_eq!(piece["title"], "test piece");

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    use crate::services::musicians::add as musicians_add;
    use crate::services::tags::add as tags_add;

    // test get-id with tags
    #[tokio::test]
    async fn test_get_id() {
        let db = init().await.unwrap();

        // Add a tag called "tag1" and another "tag2"
        let add_tag_result = tags_add(&db, String::from("tag1")).await;
        assert!(add_tag_result.is_ok());
        let tag1_id = add_tag_result.unwrap();
        let add_tag_result = tags_add(&db, String::from("tag2")).await;
        assert!(add_tag_result.is_ok());
        let tag2_id = add_tag_result.unwrap();

        let add_piece_result = add(
            &db,
            String::from("test piece1"),
            Some(2020),
            String::from("test path"),
            None,
            String::from("test notes1"),
        )
        .await;
        assert!(add_piece_result.is_ok());

        let piece_id = add_piece_result.unwrap();
        let add_tags_result = set_tags(&db, piece_id, vec![tag1_id, tag2_id]).await;
        assert!(add_tags_result.is_ok());

        let get_result = get_by_id(&db, piece_id).await;

        println!("{:#?}", get_result);
        assert!(get_result.is_ok());

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    #[tokio::test]
    async fn test_get_all() {
        let db = init().await.unwrap();

        // Add a tag called "tag1" and another "tag2"
        let add_tag_result = tags_add(&db, String::from("tag1")).await;
        assert!(add_tag_result.is_ok());
        let tag1_id = add_tag_result.unwrap();
        let add_tag_result = tags_add(&db, String::from("tag2")).await;
        assert!(add_tag_result.is_ok());
        let tag2_id = add_tag_result.unwrap();

        // Add a musician called "musician1" and another "musician2"
        let musicians_add_result = musicians_add(
            &db,
            String::from("musician1"),
            Some(String::from("lastname")),
        )
        .await;
        assert!(musicians_add_result.is_ok());
        let musician1_id = musicians_add_result.unwrap();

        let musicians_add_result = musicians_add(&db, String::from("musician2"), None).await;
        assert!(musicians_add_result.is_ok());
        let musician2_id = musicians_add_result.unwrap();

        let add_piece_result = add(
            &db,
            String::from("test piece1"),
            Some(2020),
            String::from("test path"),
            None,
            String::from("test notes1"),
        )
        .await;
        assert!(add_piece_result.is_ok());

        // Add tag1 and musician1 to piece1
        let piece_id = add_piece_result.unwrap();
        let add_tags_result = set_tags(&db, piece_id, vec![tag1_id, tag2_id]).await;
        assert!(add_tags_result.is_ok());
        let add_piece_musician_result = set_musicians(
            &db,
            piece_id,
            vec![musician1_id, musician2_id],
            "composer".into(),
        )
        .await;
        println!("{:#?}", add_piece_musician_result);
        assert!(add_piece_musician_result.is_ok());

        let add_piece_result = add(
            &db,
            String::from("test piece2"),
            Some(2021),
            String::from("test path"),
            None,
            String::from("test notes2"),
        )
        .await;
        assert!(add_piece_result.is_ok());

        let add_piece_result = add(
            &db,
            String::from("test piece3"),
            Some(2022),
            String::from("test path"),
            None,
            String::from("test notes3"),
        )
        .await;
        assert!(add_piece_result.is_ok());

        let get_pieces_result = get_all(&db).await;

        assert!(get_pieces_result.is_ok());

        let pieces = get_pieces_result.unwrap();
        println!("{:#?}", pieces);

        let close_result = db.close().await;
        assert!(close_result.is_ok());
    }

    // test get_composers
    #[tokio::test]
    async fn test_get_composers() {
        let db = init().await.unwrap();

        // Add a musician called "musician1" and another "musician2"

        let musicians_add_result = musicians_add(
            &db,
            String::from("musician1"),
            Some(String::from("lastname")),
        )
        .await
        .unwrap();
        let musician1_id = musicians_add_result;

        let musicians_add_result = musicians_add(&db, String::from("musician2"), None)
            .await
            .unwrap();
        let musician2_id = musicians_add_result;

        let musicians_add_result = musicians_add(&db, String::from("musician3"), None)
            .await
            .unwrap();
        let musician3_id = musicians_add_result;

        let add_piece_result = add(
            &db,
            String::from("test piece1"),
            Some(2020),
            String::from("test path"),
            None,
            String::from("test notes1"),
        )
        .await;

        assert!(add_piece_result.is_ok());

        let add_musician_result = set_musicians(
            &db,
            1,
            vec![musician1_id, musician2_id, musician3_id],
            "composer".into(),
        )
        .await;
        assert!(add_musician_result.is_ok());

        let get_composers_result = get_musicians(&db, 1, "composer").await;

        assert!(get_composers_result.is_ok());

        let _ = db.close().await;
    }
}
