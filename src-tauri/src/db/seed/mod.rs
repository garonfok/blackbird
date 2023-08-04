use indexmap::IndexMap;
use std::collections::HashMap;

use crate::services::{ensemble_parts, ensembles, instruments};
use indexmap::indexmap;
use sea_orm::{DatabaseConnection, DbErr};

pub async fn seed_instruments(db: &DatabaseConnection) -> Result<HashMap<&str, i32>, DbErr> {
    let woodwinds = vec![
        "Piccolo",
        "Flute",
        "Alto Flute",
        "Bass Flute",
        "Contra-alto Flute",
        "Contrabass Flute",
        "Oboe",
        "Cor Anglais",
        "Heckelphone",
        "Bass Oboe",
        "Oboe D'Amore",
        "Piccolo Clarinet in Ab",
        "Clarinet in Eb",
        "Clarinet in Bb",
        "Clarinet in A",
        "Alto Clarinet",
        "Bass Clarinet",
        "Contra-alto Clarinet",
        "Contrabass Clarinet",
        "Basset Horn",
        "Bassoon",
        "Contrabassoon",
        "Sopranino Saxophone",
        "Soprano Saxophone",
        "Alto Saxophone",
        "Tenor Saxophone",
        "Baritone Saxophone",
        "Bass Saxophone",
        "Contrabass Saxophone",
    ];
    let brass = vec![
        "Horn in F",
        "Wagner Tuba",
        "Mellophone",
        "Soprano Bugle",
        "Alto Bugle",
        "Baritone Bugle",
        "Contrabass Bugle",
        "Piccolo Trumpet in Bb",
        "Piccolo Trumpet in A",
        "Trumpet in Eb",
        "Trumpet in D",
        "Trumpet in C",
        "Trumpet in Bb",
        "Cornet in Eb",
        "Cornet in Bb",
        "Bass Trumpet",
        "Soprano Trombone",
        "Alto Trombone",
        "Tenor Trombone",
        "Bass Trombone",
        "Contrabass Trombone",
        "Flugelhorn",
        "Alto Horn",
        "Tenor Horn",
        "Baritone Horn",
        "Euphonium",
        "Tuba",
        "Sousaphone",
        "Helicon",
        "Cimbasso",
    ];
    let strings = vec![
        "Violin",
        "Viola",
        "Cello",
        "Double Bass",
        "Hurdy-gurdy",
        "Viol",
        "Erhu",
        "Saranghi",
    ];
    let plucked = vec![
        "Harp",
        "Ukulele",
        "Banjo",
        "Mandolin",
        "Dobro",
        "Lute",
        "Acoustic Guitar",
        "Classical Guitar",
        "Electric Guitar",
        "Baritone Guitar",
        "Bass Guitar",
        "Sitar",
        "Shamisen",
        "Pipa",
        "Guzheng",
        "Zhongruan",
        "Sanxian",
        "Daruan",
        "Liuqin",
    ];
    let keyboard = vec![
        "Piano",
        "Harpsichord",
        "Organ",
        "Synthesizer",
        "Celesta",
        "Accordion",
        "Bandoneon",
        "Melodica",
    ];
    let percussion = vec![
        "Anvil",
        "Bass Drum",
        "Bass Drums",
        "Bongos",
        "Castanets",
        "China Cymbal",
        "Claves",
        "Congas",
        "Cowbell",
        "Crash Cymbal",
        "Crash Cymbals",
        "Crotales",
        "Djembe",
        "Doumbek",
        "Drum Set",
        "Finger Cymbals",
        "Floor Tom",
        "Glockenspiel",
        "Guiro",
        "High Tom",
        "Hi-hat",
        "Low Tom",
        "Maracas",
        "Marimba",
        "Mark Tree",
        "Ratchet",
        "Ride Cymbal",
        "Shaker",
        "Sizzle Cymbal",
        "Slap Stick",
        "Snare Drum",
        "Suspended Cymbal",
        "Tabla",
        "Tam-tam",
        "Tambourine",
        "Temple Block",
        "Tenor Drum",
        "Tenor Drums",
        "Timpani",
        "Triangle",
        "Tubular Bells",
        "Vibraphone",
        "Whip",
        "Wood Block",
        "Xylophone",
    ];
    let voices = vec![
        "Soprano Voice",
        "Mezzo-soprano Voice",
        "Alto Voice",
        "Tenor Voice",
        "Baritone Voice",
        "Bass Voice",
        "Countertenor Voice",
    ];

    let mut instruments_map: HashMap<&str, i32> = HashMap::new();

    for instrument in woodwinds {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Woodwinds")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }
    for instrument in brass {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Brass")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }
    for instrument in strings {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Strings")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }
    for instrument in plucked {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Plucked")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }
    for instrument in keyboard {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Keyboard")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }
    for instrument in percussion {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Percussion")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }
    for instrument in voices {
        let instrument_id = instruments::add(
            &db,
            String::from(instrument),
            Some(String::from("Voices")),
            true,
        )
        .await?;
        instruments_map.insert(instrument, instrument_id);
    }

    Ok(instruments_map)
}

pub async fn seed_ensembles(
    db: &DatabaseConnection,
    instrument_map: HashMap<&str, i32>,
) -> Result<(), DbErr> {
    async fn seed_ensemble(
        db: &DatabaseConnection,
        instrument_map: HashMap<&str, i32>,
        ensemble_name: &str,
        category: &str,
        instrumentation: IndexMap<&str, Vec<&str>>,
    ) -> Result<(), DbErr> {
        // british brass band
        let ensemble_id = ensembles::add(
            &db,
            String::from(ensemble_name),
            Some(String::from(category)),
        )
        .await?;

        // Iterate through instrumentation and get the instrument id from the map
        // Add the instrument to the ensemble
        for (part_name, instrument_names) in instrumentation {
            let mut instrument_ids: Vec<i32> = vec![];
            for instrument_name in instrument_names {
                let instrument_id = instrument_map.get(instrument_name).unwrap();
                instrument_ids.push(*instrument_id);
            }
            let part_id = ensemble_parts::add(&db, String::from(part_name), ensemble_id).await?;
            ensemble_parts::set_instruments(db, part_id, instrument_ids).await?;
        }

        Ok(())
    }

    async fn seed_band(
        db: &DatabaseConnection,
        instrument_map: HashMap<&str, i32>,
    ) -> Result<(), DbErr> {
        let bbb_instrumentation = indexmap! {
            "Soprano cornet" => vec!["Cornet in Eb"],
            "Solo cornet" => vec!["Cornet in Bb"],
            "Repiano cornet" => vec!["Cornet in Bb"],
            "Cornet 2" => vec!["Cornet in Bb"],
            "Cornet 3" => vec!["Cornet in Bb"],
            "Flugelhorn" => vec!["Flugelhorn"],
            "Solo horn" => vec!["Tenor Horn"],
            "Horn 1" => vec!["Tenor Horn"],
            "Horn 2" => vec!["Tenor Horn"],
            "Baritone 1" => vec!["Baritone Horn"],
            "Baritone 2" => vec!["Baritone Horn"],
            "Trombone 1" => vec!["Tenor Trombone"],
            "Trombone 2" => vec!["Tenor Trombone"],
            "Bass trombone" => vec!["Bass Trombone"],
            "Euphonium" => vec!["Euphonium"],
            "Bass in Eb" => vec!["Tuba"],
            "Bass in Bb" => vec!["Tuba"],
            "Timpani" => vec!["Timpani"],
            "Percussion" => vec!["Snare Drum","Bass Drum", "Crash Cymbals"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "British Brass Band",
            "Band",
            bbb_instrumentation,
        )
        .await?;

        let concert_band_instrumentation = indexmap! {
            "Flute 1" => vec!["Flute"],
            "Flute 2" => vec!["Flute"],
            "Oboe 1" => vec!["Oboe"],
            "Oboe 2" => vec!["Oboe"],
            "Clarinet 1" => vec!["Clarinet in Bb"],
            "Clarinet 2" => vec!["Clarinet in Bb"],
            "Bass Clarinet" => vec!["Bass Clarinet"],
            "Bassoon 1" => vec!["Bassoon"],
            "Bassoon 2" => vec!["Bassoon"],
            "Alto Saxophone 1" => vec!["Alto Saxophone"],
            "Alto Saxophone 2" => vec!["Alto Saxophone"],
            "Tenor Saxophone" => vec!["Tenor Saxophone"],
            "Baritone Saxophone" => vec!["Baritone Saxophone"],
            "Trumpet in Bb 1" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 2" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 3" => vec!["Trumpet in Bb"],
            "Horn in F 1" => vec!["Horn in F"],
            "Horn in F 2" => vec!["Horn in F"],
            "Horn in F 3" => vec!["Horn in F"],
            "Horn in F 4" => vec!["Horn in F"],
            "Trombone 1" => vec!["Tenor Trombone"],
            "Trombone 2" => vec!["Tenor Trombone"],
            "Bass Trombone" => vec!["Bass Trombone"],
            "Euphonium" => vec!["Euphonium"],
            "Tuba" => vec!["Tuba"],
            "Timpani" => vec!["Timpani"],
            "Percussion" => vec!["Snare Drum","Bass Drum", "Crash Cymbals"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Concert Band",
            "Band",
            concert_band_instrumentation,
        )
        .await?;

        let marching_band_instrumentation = indexmap! {
            "Flute 1" => vec!["Flute"],
            "Flute 2" => vec!["Flute"],
            "Clarinet 1" => vec!["Clarinet in Bb"],
            "Clarinet 2" => vec!["Clarinet in Bb"],
            "Bass Clarinet" => vec!["Bass Clarinet"],
            "Alto Saxophone 1" => vec!["Alto Saxophone"],
            "Alto Saxophone 2" => vec!["Alto Saxophone"],
            "Tenor Saxophone" => vec!["Tenor Saxophone"],
            "Baritone Saxophone" => vec!["Baritone Saxophone"],
            "Trumpet in Bb 1" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 2" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 3" => vec!["Trumpet in Bb"],
            "Mellophone 1" => vec!["Mellophone"],
            "Mellophone 2" => vec!["Mellophone"],
            "Trombone 1" => vec!["Tenor Trombone"],
            "Trombone 2" => vec!["Tenor Trombone"],
            "Baritone" => vec!["Baritone Horn"],
            "Tuba" => vec!["Tuba"],
            "Synthesizer" => vec!["Synthesizer"],
            "Glockenspiel" => vec!["Glockenspiel"],
            "Xylophone/Crotales" => vec!["Xylophone", "Crotales"],
            "Vibraphone 1" => vec!["Vibraphone"],
            "Vibraphone 2" => vec!["Vibraphone"],
            "Marimba 1" => vec!["Marimba"],
            "Marimba 2" => vec!["Marimba"],
            "Snare Drums" => vec!["Snare Drum"],
            "Tenor Drums" => vec!["Tenor Drums"],
            "Bass Drums" => vec!["Bass Drums"],
            "Cymbals" => vec!["Crash Cymbals"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Marching Band",
            "Band",
            marching_band_instrumentation,
        )
        .await?;

        let drum_corps_instrumentation = indexmap! {
            "Trumpet in Bb 1" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 2" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 3" => vec!["Trumpet in Bb"],
            "Mellophone 1" => vec!["Mellophone"],
            "Mellophone 2" => vec!["Mellophone"],
            "Baritone 1" => vec!["Baritone Horn"],
            "Baritone 2" => vec!["Baritone Horn"],
            "Baritone 3" => vec!["Baritone Horn"],
            "Tuba" => vec!["Tuba"],
            "Synthesizer" => vec!["Synthesizer"],
            "Glockenspiel" => vec!["Glockenspiel"],
            "Xylophone/Crotales" => vec!["Xylophone", "Crotales"],
            "Vibraphone 1" => vec!["Vibraphone"],
            "Vibraphone 2" => vec!["Vibraphone"],
            "Marimba 1" => vec!["Marimba"],
            "Marimba 2" => vec!["Marimba"],
            "Snare Drums" => vec!["Snare Drum"],
            "Tenor Drums" => vec!["Tenor Drums"],
            "Bass Drums" => vec!["Bass Drums"],
            "Cymbals" => vec!["Crash Cymbals"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Drum and Bugle Corps",
            "Band",
            drum_corps_instrumentation,
        )
        .await?;

        let jazz_big_band_instrumentation = indexmap! {
            "Alto Saxophone 1" => vec!["Alto Saxophone"],
            "Alto Saxophone 2" => vec!["Alto Saxophone"],
            "Tenor Saxophone 1" => vec!["Tenor Saxophone"],
            "Tenor Saxophone 2" => vec!["Tenor Saxophone"],
            "Baritone Saxophone" => vec!["Baritone Saxophone"],
            "Trumpet in Bb 1" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 2" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 3" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 4" => vec!["Trumpet in Bb"],
            "Trombone 1" => vec!["Tenor Trombone"],
            "Trombone 2" => vec!["Tenor Trombone"],
            "Trombone 3" => vec!["Tenor Trombone"],
            "Trombone 4" => vec!["Bass Trombone"],
            "Guitar" => vec!["Electric Guitar"],
            "Piano" => vec!["Piano"],
            "Bass" => vec!["Bass Guitar"],
            "Drums" => vec!["Drum Set"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Jazz Big Band",
            "Band",
            jazz_big_band_instrumentation,
        )
        .await?;

        Ok(())
    }

    async fn seed_orchestra(
        db: &DatabaseConnection,
        instrument_map: HashMap<&str, i32>,
    ) -> Result<(), DbErr> {
        let string_orchestra_instrumentation = indexmap! {
            "Violin 1" => vec!["Violin"],
            "Violin 2" => vec!["Violin"],
            "Viola" => vec!["Viola"],
            "Cello" => vec!["Cello"],
            "Double Bass" => vec!["Double Bass"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "String Orchestra",
            "Orchestra",
            string_orchestra_instrumentation,
        )
        .await?;

        let symphony_orchestra_instrumentation = indexmap! {
            "Flute 1" => vec!["Flute"],
            "Flute 2" => vec!["Flute"],
            "Oboe 1" => vec!["Oboe"],
            "Oboe 2" => vec!["Oboe"],
            "Clarinet 1" => vec!["Clarinet in Bb"],
            "Clarinet 2" => vec!["Clarinet in Bb"],
            "Bassoon 1" => vec!["Bassoon"],
            "Bassoon 2" => vec!["Bassoon"],
            "Trumpet in Bb 1" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 2" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 3" => vec!["Trumpet in Bb"],
            "Horn in F 1" => vec!["Horn in F"],
            "Horn in F 2" => vec!["Horn in F"],
            "Horn in F 3" => vec!["Horn in F"],
            "Horn in F 4" => vec!["Horn in F"],
            "Trombone 1" => vec!["Tenor Trombone"],
            "Trombone 2" => vec!["Tenor Trombone"],
            "Bass Trombone" => vec!["Bass Trombone"],
            "Tuba" => vec!["Tuba"],
            "Timpani" => vec!["Timpani"],
            "Piano" => vec!["Piano"],
            "Violin 1" => vec!["Violin"],
            "Violin 2" => vec!["Violin"],
            "Viola" => vec!["Viola"],
            "Cello" => vec!["Cello"],
            "Double Bass" => vec!["Double Bass"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Symphony Orchestra",
            "Orchestra",
            symphony_orchestra_instrumentation,
        )
        .await?;

        Ok(())
    }

    async fn seed_choir(
        db: &DatabaseConnection,
        instrument_map: HashMap<&str, i32>,
    ) -> Result<(), DbErr> {
        let satb_instrumentation = indexmap! {
            "Soprano" => vec!["Soprano Voice"],
            "Alto" => vec!["Alto Voice"],
            "Tenor" => vec!["Tenor Voice"],
            "Bass" => vec!["Bass Voice"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "SATB Choir",
            "Choir",
            satb_instrumentation,
        )
        .await?;

        let satb_piano_instrumentation = indexmap! {
            "Soprano" => vec!["Soprano Voice"],
            "Alto" => vec!["Alto Voice"],
            "Tenor" => vec!["Tenor Voice"],
            "Bass" => vec!["Bass Voice"],
            "Piano" => vec!["Piano"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "SATB Choir with Piano",
            "Choir",
            satb_piano_instrumentation,
        )
        .await?;

        let ssa_instrumentation = indexmap! {
            "Soprano 1" => vec!["Soprano Voice"],
            "Soprano 2" => vec!["Soprano Voice"],
            "Alto" => vec!["Alto Voice"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "SSA Choir",
            "Choir",
            ssa_instrumentation,
        )
        .await?;

        let ssa_piano_instrumentation = indexmap! {
            "Soprano 1" => vec!["Soprano Voice"],
            "Soprano 2" => vec!["Soprano Voice"],
            "Alto" => vec!["Alto Voice"],
            "Piano" => vec!["Piano"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "SSA Choir with Piano",
            "Choir",
            ssa_piano_instrumentation,
        )
        .await?;

        let ttbb_instrumentation = indexmap! {
            "Tenor 1" => vec!["Tenor Voice"],
            "Tenor 2" => vec!["Tenor Voice"],
            "Bass 1" => vec!["Bass Voice"],
            "Bass 2" => vec!["Bass Voice"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "TTBB Choir",
            "Choir",
            ttbb_instrumentation,
        )
        .await?;

        let ttbb_piano_instrumentation = indexmap! {
            "Tenor 1" => vec!["Tenor Voice"],
            "Tenor 2" => vec!["Tenor Voice"],
            "Bass 1" => vec!["Bass Voice"],
            "Bass 2" => vec!["Bass Voice"],
            "Piano" => vec!["Piano"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "TTBB Choir with Piano",
            "Choir",
            ttbb_piano_instrumentation,
        )
        .await?;

        let satbbb_instrumentation = indexmap! {
            "Soprano" => vec!["Soprano Voice"],
            "Alto" => vec!["Alto Voice"],
            "Tenor" => vec!["Tenor Voice"],
            "Baritone 1" => vec!["Baritone Voice"],
            "Baritone 2" => vec!["Baritone Voice"],
            "Bass" => vec!["Bass Voice"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "SATBBB Choir",
            "Choir",
            satbbb_instrumentation,
        )
        .await?;

        let barbershop_instrumentation = indexmap! {
            "Tenor" => vec!["Tenor Voice"],
            "Lead" => vec!["Tenor Voice"],
            "Baritone" => vec!["Baritone Voice"],
            "Bass" => vec!["Bass Voice"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Barbershop Quartet",
            "Choir",
            barbershop_instrumentation,
        )
        .await?;

        Ok(())
    }

    async fn seed_chamber(
        db: &DatabaseConnection,
        instrument_map: HashMap<&str, i32>,
    ) -> Result<(), DbErr> {
        let string_quartet_instrumentation = indexmap! {
            "Violin 1" => vec!["Violin"],
            "Violin 2" => vec!["Violin"],
            "Viola" => vec!["Viola"],
            "Cello" => vec!["Cello"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "String Quartet",
            "Chamber",
            string_quartet_instrumentation,
        )
        .await?;

        let string_trio_instrumentation = indexmap! {
            "Violin" => vec!["Violin"],
            "Viola" => vec!["Viola"],
            "Cello" => vec!["Cello"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "String Trio",
            "Chamber",
            string_trio_instrumentation,
        )
        .await?;

        let piano_trio_instrumentation = indexmap! {
            "Violin" => vec!["Violin"],
            "Cello" => vec!["Cello"],
            "Piano" => vec!["Piano"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Piano Trio",
            "Chamber",
            piano_trio_instrumentation,
        )
        .await?;

        let woodwind_quintet_instrumentation = indexmap! {
            "Flute" => vec!["Flute"],
            "Oboe" => vec!["Oboe"],
            "Clarinet in Bb" => vec!["Clarinet in Bb"],
            "Horn in F" => vec!["Horn in F"],
            "Bassoon" => vec!["Bassoon"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Woodwind Quintet",
            "Chamber",
            woodwind_quintet_instrumentation,
        )
        .await?;

        let brass_quintet_instrumentation = indexmap! {
            "Trumpet in Bb 1" => vec!["Trumpet in Bb"],
            "Trumpet in Bb 2" => vec!["Trumpet in Bb"],
            "Horn in F" => vec!["Horn in F"],
            "Trombone" => vec!["Tenor Trombone"],
            "Tuba" => vec!["Tuba"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Brass Quintet",
            "Chamber",
            brass_quintet_instrumentation,
        )
        .await?;

        let saxophone_quartet_instrumentation = indexmap! {
            "Soprano Saxophone" => vec!["Soprano Saxophone"],
            "Alto Saxophone" => vec!["Alto Saxophone"],
            "Tenor Saxophone" => vec!["Tenor Saxophone"],
            "Baritone Saxophone" => vec!["Baritone Saxophone"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Saxophone Quartet",
            "Chamber",
            saxophone_quartet_instrumentation,
        )
        .await?;

        let tuba_euphonium_quartet_instrumentation = indexmap! {
            "Euphonium 1" => vec!["Euphonium"],
            "Euphonium 2" => vec!["Euphonium"],
            "Tuba 1" => vec!["Tuba"],
            "Tuba 2" => vec!["Tuba"],
        };
        seed_ensemble(
            db,
            instrument_map.clone(),
            "Tuba-Euphonium Quartet",
            "Chamber",
            tuba_euphonium_quartet_instrumentation,
        )
        .await?;

        Ok(())
    }

    seed_band(db, instrument_map.clone()).await?;
    seed_orchestra(db, instrument_map.clone()).await?;
    seed_choir(db, instrument_map.clone()).await?;
    seed_chamber(db, instrument_map.clone()).await?;

    Ok(())
}

pub async fn seed(db: &DatabaseConnection) -> Result<(), DbErr> {
    let instrument_map = seed_instruments(&db).await?;
    seed_ensembles(&db, instrument_map).await?;

    Ok(())
}
