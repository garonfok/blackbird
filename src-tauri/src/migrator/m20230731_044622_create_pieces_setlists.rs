use sea_orm_migration::prelude::*;

use super::m20230724_024746_create_pieces::Pieces;
use super::m20230731_044608_create_setlists::Setlists;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PiecesSetlists::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(PiecesSetlists::PieceId).integer().not_null())
                    .col(
                        ColumnDef::new(PiecesSetlists::SetlistId)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .col(PiecesSetlists::PieceId)
                            .col(PiecesSetlists::SetlistId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_piece_setlist_piece")
                            .from(PiecesSetlists::Table, PiecesSetlists::PieceId)
                            .to(Pieces::Table, Pieces::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_piece_setlist_setlist")
                            .from(PiecesSetlists::Table, PiecesSetlists::SetlistId)
                            .to(Setlists::Table, Setlists::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PiecesSetlists::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum PiecesSetlists {
    Table,
    PieceId,
    SetlistId,
}
