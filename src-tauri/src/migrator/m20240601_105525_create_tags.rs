use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let current_timestamp = chrono::Local::now().naive_local();
        manager
            .create_table(
                Table::create()
                    .table(Tags::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(Tags::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(ColumnDef::new(Tags::Name).string().not_null())
                    .col(
                        ColumnDef::new(Tags::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .col(
                        ColumnDef::new(Tags::UpdatedAt)
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
            .drop_table(Table::drop().table(Tags::Table).to_owned())
            .await
    }
}

#[derive(Iden)]
pub enum Tags {
    Table,
    Id,
    Name,
    CreatedAt,
    UpdatedAt,
}