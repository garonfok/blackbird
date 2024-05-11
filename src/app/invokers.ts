import { invoke } from "@tauri-apps/api";
import { Instrument, Musician, Piece, Setlist, Tag } from "./types";

export async function piecesUpdate({ id, title, notes, yearPublished, path, difficulty }: { id: number, title: string, notes: string, yearPublished?: number, path?: string, difficulty?: number }) {
  await invoke("pieces_update", {
    id,
    title,
    notes,
    yearPublished,
    path,
    difficulty
  })
}

export async function piecesSetTags({ pieceId, tagIds }: { pieceId: number, tagIds: number[] }) {
  await invoke("pieces_set_tags", {
    pieceId,
    tagIds
  })
}

export async function piecesSetMusicians({ pieceId, musicianIds, role }: { pieceId: number, musicianIds: number[], role: "composer" | "arranger" | "orchestrator" | "transcriber" | "lyricist" }) {
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds,
    role
  })
}

export async function scoresAdd({ pieceId, name, path }: { pieceId: number, name: string, path?: string }): Promise<number> {
  const scoreId: number = await invoke("scores_add", {
    pieceId,
    name,
    path
  })

  return scoreId
}

export async function partsAdd({ pieceId, name, path }: { pieceId: number, name: string, path?: string }): Promise<number> {
  const partId: number = await invoke("parts_add", {
    pieceId,
    name,
    path
  })

  return partId
}

export async function partsSetInstruments({ partId, instrumentIds }: { partId: number, instrumentIds: number[] }) {
  await invoke("parts_set_instruments", {
    partId,
    instrumentIds
  })
}

export async function piecesGet({ id }: { id: number }): Promise<Piece> {
  const piece: Piece = await invoke("pieces_get", {
    id
  })

  return piece
}

export async function getWorkingDirectory(): Promise<string> {
  const workingDirectory: string = await invoke("get_working_directory")

  return workingDirectory
}

export async function piecesDropScores({ id }: { id: number }) {
  await invoke("pieces_drop_scores", {
    id
  })
}

export async function piecesDropParts({ id }: { id: number }) {
  await invoke("pieces_drop_parts", {
    id
  })
}

export async function piecesAdd({ title, notes, yearPublished, difficulty, path }: { title: string, notes: string, yearPublished?: number, difficulty?: number, path?: string }): Promise<number> {
  const pieceId: number = await invoke("pieces_add", {
    title,
    notes,
    yearPublished,
    difficulty,
    path
  })

  return pieceId
}

export async function getDatabaseExists({ path }: { path: string }): Promise<boolean> {
  const databaseExists: boolean = await invoke("get_database_exists", {
    path
  })

  return databaseExists
}

export async function getDirEmpty({ path }: { path: string }): Promise<boolean> {
  const isDirEmpty: boolean = await invoke("get_dir_empty", {
    path
  })

  return isDirEmpty
}

export async function changeWorkingDirectory({ path }: { path: string }) {
  await invoke("set_working_directory", {
    path
  })
}

export async function openFolder({ path }: { path: string }) {
  await invoke("open", {
    path
  })
}

export async function tagsGetAll(): Promise<Tag[]> {
  const tags: Tag[] = await invoke("tags_get_all")

  return tags
}

export async function setlistsGetAll(): Promise<Setlist[]> {
  const setlists: Setlist[] = await invoke("setlists_get_all")

  return setlists
}

export async function setlistsDelete({ id }: { id: number }) {
  await invoke("setlists_delete", {
    id
  })
}

export async function tagsDelete({ id }: { id: number }) {
  await invoke("tags_delete", {
    id
  })
}

export async function setlistsUpdate({ id, name }: { id: number, name: string }) {
  await invoke("setlists_update", {
    id,
    name
  })
}

export async function setlistsAdd({ name }: { name: string }) {
  await invoke("setlists_add", {
    name
  })
}

export async function tagsAdd({ name, color }: { name: string, color: string }) {
  const tagId: number = await invoke("tags_add", {
    name,
    color
  })

  return tagId
}

export async function tagsUpdate({ id, name, color }: { id: number, name: string, color: string }) {
  await invoke("tags_update", {
    id,
    name,
    color
  })
}

export async function openWizard({ pieceId }: { pieceId?: number }) {
  if (pieceId) {
    await invoke("open_wizard", {
      pieceId
    })
  } else {
    await invoke("open_wizard")
  }
}

export async function piecesGetBySetlist({ setlistId }: { setlistId: number }) {
  const pieces: Piece[] = await invoke("pieces_get_by_setlist", {
    setlistId
  })

  return pieces
}

export async function piecesGetAll() {
  const pieces: Piece[] = await invoke("pieces_get_all")

  return pieces
}

export async function piecesDelete({ id }: { id: number }) {
  await invoke("pieces_delete", {
    id
  })
}

export async function setlistsAddPiece({ setlistId, pieceId }: { setlistId: number, pieceId: number }) {
  await invoke("setlists_add_piece", {
    setlistId,
    pieceId
  })
}

export async function setlistsRemovePiece({ setlistId, pieceId }: { setlistId: number, pieceId: number }) {
  await invoke("setlists_remove_piece", {
    setlistId,
    pieceId
  })
}

export async function instrumentsGetAll() {
  const instruments: Instrument[] = await invoke("instruments_get_all")

  return instruments
}

export async function musiciansGetAll() {
  const musicians: Musician[] = await invoke("musicians_get_all")

  return musicians
}

export async function musiciansDelete({ id }: { id: number }) {
  await invoke("musicians_delete", {
    id
  })
}

export async function musiciansAdd({ firstName, lastName }: { firstName: string, lastName?: string }) {
  const musicianId: number = await invoke("musicians_add", {
    firstName,
    lastName
  })

  return musicianId
}


export async function musiciansUpdate({ id, firstName, lastName }: { id: number, firstName: string, lastName?: string }) {
  await invoke("musicians_update", {
    id,
    firstName,
    lastName
  })
}

export async function closeWindow({ windowLabel }: { windowLabel: string }) {
  await invoke("close_window", {
    windowLabel
  })
}

export async function tagsGet({ id }: { id: number }) {
  const tag: Tag = await invoke("tags_get", {
    id
  })

  return tag
}

export async function musiciansGet({ id }: { id: number }) {
  const musician: Musician = await invoke("musicians_get", {
    id
  })

  return musician
}
