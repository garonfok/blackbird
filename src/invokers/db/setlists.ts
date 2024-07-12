import { Setlist } from "@/types";
import { invoke } from "@tauri-apps/api";

export async function setlistsGetAll(): Promise<Setlist[]> {
  const setlists: Setlist[] = await invoke("setlists_get_all");

  return setlists;
}

export async function setlistsDelete({ id }: { id: number }) {
  await invoke("setlists_delete", {
    id,
  });
}

export async function setlistsUpdate({
  id,
  name,
}: {
  id: number;
  name: string;
}) {
  await invoke("setlists_update", {
    id,
    name,
  });
}

export async function setlistsAdd({ name }: { name: string }) {
  await invoke("setlists_add", {
    name,
  });
}

export async function setlistsAddPiece({
  setlistId,
  pieceId,
}: {
  setlistId: number;
  pieceId: number;
}) {
  await invoke("setlists_add_piece", {
    setlistId,
    pieceId,
  });
}

export async function setlistsRemovePiece({
  setlistId,
  pieceId,
}: {
  setlistId: number;
  pieceId: number;
}) {
  await invoke("setlists_remove_piece", {
    setlistId,
    pieceId,
  });
}
