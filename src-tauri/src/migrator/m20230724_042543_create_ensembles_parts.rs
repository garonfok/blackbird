use sea_orm_migration::prelude::*;

use super::m20230724_024826_create_ensembles::Ensembles;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        let current_timestamp = chrono::Local::now().naive_local();
        manager
            .create_table(
                Table::create()
                    .table(EnsemblesParts::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EnsemblesParts::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(EnsemblesParts::EnsembleId)
                            .integer()
                            .not_null(),
                    )
                    .col(ColumnDef::new(EnsemblesParts::Name).string().not_null())
                    .col(
                        ColumnDef::new(EnsemblesParts::CreatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .col(
                        ColumnDef::new(EnsemblesParts::UpdatedAt)
                            .date_time()
                            .not_null()
                            .default(current_timestamp.to_string()),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_ensemble_part_ensemble")
                            .from(EnsemblesParts::Table, EnsemblesParts::EnsembleId)
                            .to(Ensembles::Table, Ensembles::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(EnsemblesParts::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
pub enum EnsemblesParts {
    Table,
    Id,
    EnsembleId,
    Name,
    CreatedAt,
    UpdatedAt,
}
