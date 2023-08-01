use sea_orm_migration::prelude::*;

use super::m20230724_024746_create_pieces::Pieces;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Parts::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Parts::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Parts::Name).string().not_null())
                    .col(ColumnDef::new(Parts::Path).string())
                    .col(
                        ColumnDef::new(Parts::CreatedAt)
                            .date_time()
                            .not_null()
                            .default("DATETIME PLACEHOLDER"),
                    )
                    .col(
                        ColumnDef::new(Parts::UpdatedAt)
                            .date_time()
                            .not_null()
                            .default("DATETIME PLACEHOLDER"),
                    )
                    .col(ColumnDef::new(Parts::PieceId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_part_piece")
                            .from(Parts::Table, Parts::PieceId)
                            .to(Pieces::Table, Pieces::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Parts::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Parts {
    Table,
    Id,
    Name,
    Path,
    CreatedAt,
    UpdatedAt,
    PieceId,
}
