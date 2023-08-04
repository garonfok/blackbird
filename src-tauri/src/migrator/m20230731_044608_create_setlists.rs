use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let current_timestamp = chrono::offset::Local::now();
        manager
            .create_table(
                Table::create()
                    .table(Setlists::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Setlists::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Setlists::Name).string().not_null())
                    .col(
                        ColumnDef::new(Setlists::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .col(
                        ColumnDef::new(Setlists::UpdatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(Setlists::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Setlists {
    Table,
    Id,
    Name,
    CreatedAt,
    UpdatedAt,
}
