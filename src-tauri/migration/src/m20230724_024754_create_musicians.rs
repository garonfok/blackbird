use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Musicians::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Musicians::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Musicians::FirstName).string().not_null())
                    .col(ColumnDef::new(Musicians::LastName).string())
                    .col(
                        ColumnDef::new(Musicians::CreatedAt)
                            .date_time()
                            .not_null()
                            .default("DATETIME PLACEHOLDER"),
                    )
                    .col(
                        ColumnDef::new(Musicians::UpdatedAt)
                            .date_time()
                            .not_null()
                            .default("DATETIME PLACEHOLDER"),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Musicians::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Musicians {
    Table,
    Id,
    FirstName,
    LastName,
    CreatedAt,
    UpdatedAt,
}
