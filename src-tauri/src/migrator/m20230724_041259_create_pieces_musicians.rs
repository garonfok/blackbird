use sea_orm_migration::prelude::*;

use super::m20230724_024746_create_pieces::Pieces;
use super::m20230724_024754_create_musicians::Musicians;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PiecesMusicians::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PiecesMusicians::PieceId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PiecesMusicians::MusicianId)
                            .integer()
                            .not_null(),
                    )
                    .col(ColumnDef::new(PiecesMusicians::Role).string().not_null())
                    .col(ColumnDef::new(PiecesMusicians::Order).integer().not_null())
                    .primary_key(
                        Index::create()
                            .col(PiecesMusicians::PieceId)
                            .col(PiecesMusicians::MusicianId)
                            .col(PiecesMusicians::Role),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_piece_musician_piece")
                            .from(PiecesMusicians::Table, PiecesMusicians::PieceId)
                            .to(Pieces::Table, Pieces::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_piece_musician_musician")
                            .from(PiecesMusicians::Table, PiecesMusicians::MusicianId)
                            .to(Musicians::Table, Musicians::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PiecesMusicians::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum PiecesMusicians {
    Table,
    PieceId,
    MusicianId,
    Role,
    Order,
}
