use sea_orm_migration::prelude::*;

use super::m20230724_024751_create_parts::Parts;
use super::m20230724_024758_create_instruments::Instruments;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .create_table(
                Table::create()
                    .table(PartsInstruments::Table)
                    .if_not_exists()
                    .col(
                        ColumnDef::new(PartsInstruments::PartId)
                            .integer()
                            .not_null(),
                    )
                    .col(
                        ColumnDef::new(PartsInstruments::InstrumentId)
                            .integer()
                            .not_null(),
                    )
                    .primary_key(
                        Index::create()
                            .col(PartsInstruments::PartId)
                            .col(PartsInstruments::InstrumentId),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_part_instrument_part")
                            .from(PartsInstruments::Table, PartsInstruments::PartId)
                            .to(Parts::Table, Parts::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_part_instrument_instrument")
                            .from(PartsInstruments::Table, PartsInstruments::InstrumentId)
                            .to(Instruments::Table, Instruments::Id)
                            .on_delete(ForeignKeyAction::Cascade),
                    )
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager
            .drop_table(Table::drop().table(PartsInstruments::Table).to_owned())
            .await
    }
}

/// Learn more at https://docs.rs/sea-query#iden
#[derive(Iden)]
enum PartsInstruments {
    Table,
    PartId,
    InstrumentId,
}
