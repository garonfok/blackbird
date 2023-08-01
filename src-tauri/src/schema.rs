// @generated automatically by Diesel CLI.

diesel::table! {
    ensembles (id) {
        id -> Integer,
        name -> Text,
    }
}

diesel::table! {
    ensembles_instruments (ensemble_id, instrument_id) {
        ensemble_id -> Integer,
        instrument_id -> Integer,
    }
}

diesel::table! {
    instruments (id) {
        id -> Integer,
        name -> Text,
        is_default -> Bool,
    }
}

diesel::table! {
    musicians (id) {
        id -> Integer,
        first_name -> Text,
        last_name -> Nullable<Text>,
    }
}

diesel::table! {
    part_instruments (part_id, instrument_id) {
        part_id -> Integer,
        instrument_id -> Integer,
    }
}

diesel::table! {
    parts (id) {
        id -> Integer,
        name -> Text,
        path -> Text,
        piece_id -> Integer,
    }
}

diesel::table! {
    pieces (id) {
        id -> Integer,
        title -> Text,
        year_published -> Nullable<Integer>,
        path -> Text,
        difficulty -> Nullable<Integer>,
        notes -> Text,
        updated_at -> Timestamp,
        created_at -> Timestamp,
    }
}

diesel::table! {
    pieces_musicians (piece_id, musician_id, role) {
        piece_id -> Integer,
        musician_id -> Integer,
        role -> Text,
        list_order -> Integer,
    }
}

diesel::table! {
    pieces_tags (piece_id, tag_id) {
        piece_id -> Integer,
        tag_id -> Integer,
    }
}

diesel::table! {
    tags (id) {
        id -> Integer,
        name -> Text,
        color -> Text,
    }
}

diesel::allow_tables_to_appear_in_same_query!(
    ensembles,
    ensembles_instruments,
    instruments,
    musicians,
    part_instruments,
    parts,
    pieces,
    pieces_musicians,
    pieces_tags,
    tags,
);
