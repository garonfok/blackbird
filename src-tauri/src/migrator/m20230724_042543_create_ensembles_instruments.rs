use sea_orm_migration::prelude::*;

use super::m20230724_024758_create_instruments::Instruments;
use super::m20230724_024826_create_ensembles::Ensembles;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(EnsemblesInstruments::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EnsemblesInstruments::Id)
                            .integer()
                            .not_null()
                            .auto_increment()
                            .primary_key(),
                    )
                    .col(
                        ColumnDef::new(EnsemblesInstruments::EnsembleId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(EnsemblesInstruments::InstrumentId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(EnsemblesInstruments::Name)
                            .string()
                            .not_null(),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_ensemble_instrument_ensemble")
                            .from(
                                EnsemblesInstruments::Table,
                                EnsemblesInstruments::EnsembleId,
                            )
                            .to(Ensembles::Table, Ensembles::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_ensemble_instrument_instrument")
                            .from(
                                EnsemblesInstruments::Table,
                                EnsemblesInstruments::InstrumentId,
                            )
                            .to(Instruments::Table, Instruments::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(EnsemblesInstruments::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum EnsemblesInstruments {
    Table,
    Id,
    EnsembleId,
    InstrumentId,
    Name,
}
