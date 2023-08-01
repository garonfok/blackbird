//! `SeaORM` Entity. Generated by sea-orm-codegen 0.11.3

use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Eq)]
#[sea_orm(table_name = "pieces_setlists")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub piece_id: i32,
    #[sea_orm(primary_key, auto_increment = false)]
    pub setlist_id: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::pieces::Entity",
        from = "Column::PieceId",
        to = "super::pieces::Column::Id",
        on_update = "NoAction",
        on_delete = "NoAction"
    )]
    Pieces,
    #[sea_orm(
        belongs_to = "super::setlists::Entity",
        from = "Column::SetlistId",
        to = "super::setlists::Column::Id",
        on_update = "NoAction",
        on_delete = "Cascade"
    )]
    Setlists,
}

impl Related<super::pieces::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Pieces.def()
    }
}

impl Related<super::setlists::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Setlists.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
