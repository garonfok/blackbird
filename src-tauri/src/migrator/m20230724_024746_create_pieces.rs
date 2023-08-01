use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Pieces::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Pieces::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Pieces::Title).string().not_null())
                    .col(ColumnDef::new(Pieces::YearPublished).integer())
                    .col(ColumnDef::new(Pieces::Path).string().not_null())
                    .col(ColumnDef::new(Pieces::Difficulty).integer())
                    .col(
                        ColumnDef::new(Pieces::Notes)
                            .string()
                            .not_null()
                            .default("".to_string()),
                    )
                    .col(
                        ColumnDef::new(Pieces::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(chrono::Utc::now().naive_utc().to_string()),
                    )
                    .col(
                        ColumnDef::new(Pieces::UpdatedAt)
                            .date_time()
                            .not_null()
                            .default(chrono::Utc::now().naive_utc().to_string()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Pieces::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Pieces {
    Table,
    Id,
    Title,
    YearPublished,
    Path,
    Difficulty,
    Notes,
    CreatedAt,
    UpdatedAt,
}
