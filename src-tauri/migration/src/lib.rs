pub use sea_orm_migration::prelude::*;

mod m20230724_024746_create_pieces;
mod m20230724_024751_create_parts;
mod m20230724_024754_create_musicians;
mod m20230724_024758_create_instruments;
mod m20230724_024817_create_tags;
mod m20230724_024826_create_ensembles;
mod m20230724_035659_create_pieces_tags;
mod m20230724_041259_create_pieces_musicians;
mod m20230724_042016_create_parts_instruments;
mod m20230724_042543_create_ensembles_parts;
mod m20230728_092102_create_scores;
mod m20230731_044608_create_setlists;
mod m20230731_044622_create_pieces_setlists;
mod m20230803_094322_create_ensemble_parts_instruments;
mod m20240601_105525_create_tags;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20230724_024746_create_pieces::Migration),
            Box::new(m20230724_024751_create_parts::Migration),
            Box::new(m20230724_024754_create_musicians::Migration),
            Box::new(m20230724_024758_create_instruments::Migration),
            Box::new(m20230724_024826_create_ensembles::Migration),
            Box::new(m20230724_035659_create_pieces_tags::Migration),
            Box::new(m20230724_041259_create_pieces_musicians::Migration),
            Box::new(m20230724_042016_create_parts_instruments::Migration),
            Box::new(m20230724_042543_create_ensembles_parts::Migration),
            Box::new(m20230728_092102_create_scores::Migration),
            Box::new(m20230731_044608_create_setlists::Migration),
            Box::new(m20230731_044622_create_pieces_setlists::Migration),
            Box::new(m20230803_094322_create_ensemble_parts_instruments::Migration),
            Box::new(m20240601_105525_create_tags::Migration),
        ]
    }
}
