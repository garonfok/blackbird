use crate::db::schema::{part_instruments, parts, piece_musicians, piece_tags, pieces, tags};
use serde::{Deserialize, Serialize};

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(table_name = "pieces")]
pub struct Piece {
    pub id: i32,
    pub title: String,
    pub year_published: i8,
    pub path: String,
    pub difficulty: i8,
    pub notes: String,
    pub updated_at: String,
    pub created_at: String,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(belongs_to(Piece))]
#[diesel(table_name = "parts")]
pub struct Part {
    pub id: i32,
    pub name: String,
    pub path: String,
    pub piece_id: i32,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(table_name = "instruments")]
pub struct Instrument {
    pub id: i32,
    pub name: String,
    pub is_default: bool,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(table_name = "musicians")]
pub struct Musician {
    pub id: i32,
    pub first_name: String,
    pub last_name: String,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(table_name = "tags")]
pub struct Tag {
    pub id: i32,
    pub name: String,
    pub color: String,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(table_name = "ensembles")]
pub struct Ensemble {
    pub id: i32,
    pub name: String,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(belongs_to(Piece))]
#[diesel(belongs_to(Musician))]
#[diesel(table_name = "pieces_musicians")]
pub struct PieceMusician {
    pub piece_id: i32,
    pub musician_id: i32,
    pub role: String,
    pub list_order: i32,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(belongs_to(Piece))]
#[diesel(belongs_to(Instrument))]
#[diesel(table_name = "part_instruments")]
pub struct PartInstrument {
    pub part_id: i32,
    pub instrument_id: i32,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(belongs_to(Piece))]
#[diesel(belongs_to(Tag))]
#[diesel(table_name = "pieces_tags")]
pub struct PieceTag {
    pub piece_id: i32,
    pub tag_id: i32,
}

#[derive(Queryable, Serialize, Associations, Identifiable, Debug)]
#[diesel(belongs_to(Ensemble))]
#[diesel(belongs_to(Instrument))]
#[diesel(table_name = "ensembles_instruments")]
pub struct EnsembleInstrument {
    pub ensemble_id: i32,
    pub instrument_id: i32,
}
