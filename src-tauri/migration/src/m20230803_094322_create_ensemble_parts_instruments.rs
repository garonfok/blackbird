use sea_orm_migration::prelude::*;

use super::m20230724_024758_create_instruments::Instruments;
use super::m20230724_042543_create_ensembles_parts::EnsemblesParts;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(EnsemblePartsInstruments::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(EnsemblePartsInstruments::PartId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(EnsemblePartsInstruments::InstrumentId)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .col(EnsemblePartsInstruments::PartId)
                            .col(EnsemblePartsInstruments::InstrumentId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_part_instrument_part")
                            .from(EnsemblePartsInstruments::Table, EnsemblePartsInstruments::PartId)
                            .to(EnsemblesParts::Table, EnsemblesParts::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_part_instrument_instrument")
                            .from(EnsemblePartsInstruments::Table, EnsemblePartsInstruments::InstrumentId)
                            .to(Instruments::Table, Instruments::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(EnsemblePartsInstruments::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum EnsemblePartsInstruments {
    Table,
    PartId,
    InstrumentId,
}
