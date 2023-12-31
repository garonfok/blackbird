//! `SeaORM` Entity. Generated by sea-orm-codegen 0.11.3

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "pieces")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub title: String,
    pub year_published: Option<i32>,
    pub path: String,
    pub difficulty: Option<i32>,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(has_many = "super::parts::Entity")]
    Parts,
    #[sea_orm(has_many = "super::pieces_musicians::Entity")]
    PiecesMusicians,
    #[sea_orm(has_many = "super::scores::Entity")]
    Scores,
}

impl Related<super::parts::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Parts.def()
    }
}

impl Related<super::pieces_musicians::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::PiecesMusicians.def()
    }
}

impl Related<super::scores::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Scores.def()
    }
}

impl Related<super::tags::Entity> for Entity {
    fn to() -> RelationDef {
        super::pieces_tags::Relation::Tags.def()
    }
    fn via() -> Option<RelationDef> {
        Some(super::pieces_tags::Relation::Pieces.def().rev())
    }
}

impl Related<super::setlists::Entity> for Entity {
    fn to() -> RelationDef {
        super::pieces_setlists::Relation::Setlists.def()
    }
    fn via() -> Option<RelationDef> {
        Some(super::pieces_setlists::Relation::Pieces.def().rev())
    }
}

impl ActiveModelBehavior for ActiveModel {}
