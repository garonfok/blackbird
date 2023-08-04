use sea_orm_migration::prelude::*;

use super::m20230724_024746_create_pieces::Pieces;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let current_timestamp = chrono::offset::Local::now();
        manager
            .create_table(
                Table::create()
                    .table(Scores::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Scores::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Scores::Name).string().not_null())
                    .col(ColumnDef::new(Scores::Path).string())
                    .col(
                        ColumnDef::new(Scores::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .col(
                        ColumnDef::new(Scores::UpdatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .col(ColumnDef::new(Scores::PieceId).integer().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_part_piece")
                            .from(Scores::Table, Scores::PieceId)
                            .to(Pieces::Table, Pieces::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Scores::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum Scores {
    Table,
    Id,
    Name,
    Path,
    CreatedAt,
    UpdatedAt,
    PieceId,
}
