use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(Ensembles::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Ensembles::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Ensembles::Name).string().not_null())
                    .col(ColumnDef::new(Ensembles::Category).string())
                    .col(
                        ColumnDef::new(Ensembles::CreatedAt)
                            .date_time()
                            .not_null()
                            .default("DATETIME PLACEHOLDER"),
                    )
                    .col(
                        ColumnDef::new(Ensembles::UpdatedAt)
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
            .drop_table(Table::drop().table(Ensembles::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum Ensembles {
    Table,
    Id,
    Name,
    Category,
    CreatedAt,
    UpdatedAt,
}
