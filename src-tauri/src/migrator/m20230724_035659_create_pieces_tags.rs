use sea_orm_migration::prelude::*;

use super::m20230724_024746_create_pieces::Pieces;
use super::m20240601_105525_create_tags::Tags;
#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PiecesTags::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(PiecesTags::PieceId).integer().not_null())
                    .col(ColumnDef::new(PiecesTags::TagId).integer().not_null())
                    .primary_key(
                        Index::create()
                            .col(PiecesTags::PieceId)
                            .col(PiecesTags::TagId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_piece_tag_piece")
                            .from(PiecesTags::Table, PiecesTags::PieceId)
                            .to(Pieces::Table, Pieces::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_piece_tag_tag")
                            .from(PiecesTags::Table, PiecesTags::TagId)
                            .to(Tags::Table, Tags::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PiecesTags::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum PiecesTags {
    Table,
    PieceId,
    TagId,
}
