
import { Piece } from "@/types";
import { invoke } from "@tauri-apps/api";

export async function piecesGet({ id }: { id: number }): Promise<Piece> {
  const piece: Piece = await invoke("pieces_get_by_id", {
    id,
  });

  return piece;
}

export async function piecesUpdate({
  id,
  title,
  notes,
  yearPublished,
  path,
  difficulty,
}: {
  id: number;
  title: string;
  notes: string;
  yearPublished?: number;
  path?: string;
  difficulty?: number;
}) {
  await invoke("pieces_update", {
    id,
    title,
    notes,
    yearPublished,
    path,
    difficulty,
  });
}

export async function piecesSetTags({
  pieceId,
  tagIds,
}: {
  pieceId: number;
  tagIds: number[];
}) {
  await invoke("pieces_set_tags", {
    pieceId,
    tagIds,
  });
}

export async function piecesSetMusicians({
  pieceId,
  musicianIds,
  role,
}: {
  pieceId: number;
  musicianIds: number[];
  role: "composer" | "arranger" | "orchestrator" | "transcriber" | "lyricist";
}) {
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds,
    role,
  });
}

export async function piecesDropScores({ id }: { id: number }) {
  await invoke("pieces_drop_scores", {
    id,
  });
}

export async function piecesDropParts({ id }: { id: number }) {
  await invoke("pieces_drop_parts", {
    id,
  });
}

export async function piecesAdd({
  title,
  notes,
  yearPublished,
  difficulty,
  path,
}: {
  title: string;
  notes: string;
  yearPublished?: number;
  difficulty?: number;
  path?: string;
}): Promise<number> {
  const pieceId: number = await invoke("pieces_add", {
    title,
    notes,
    yearPublished,
    difficulty,
    path,
  });

  return pieceId;
}

export async function piecesGetBySetlist({ setlistId }: { setlistId: number }) {
  const pieces: Piece[] = await invoke("pieces_get_by_setlist", {
    setlistId,
  });

  return pieces;
}

export async function piecesGetAll() {
  const pieces: Piece[] = await invoke("pieces_get_all");

  return pieces;
}

export async function piecesDelete({ id }: { id: number }) {
  await invoke("pieces_delete", {
    id,
  });
}
