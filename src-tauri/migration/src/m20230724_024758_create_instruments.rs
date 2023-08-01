use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Instruments::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Instruments::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Instruments::Name).string().not_null())
                    .col(
                        ColumnDef::new(Instruments::IsDefault)
                            .boolean()
                            .not_null()
                            .default(false),
                    )
                    .col(
                        ColumnDef::new(Instruments::CreatedAt)
                            .date_time()
                            .not_null()
                            .default("DATETIME PLACEHOLDER"),
                    )
                    .col(
                        ColumnDef::new(Instruments::UpdatedAt)
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
            .drop_table(Table::drop().table(Instruments::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Instruments {
    Table,
    Id,
    Name,
    IsDefault,
    CreatedAt,
    UpdatedAt,
}
