import { invoke } from "@tauri-apps/api";

export async function partsAdd({
  pieceId,
  name,
  path,
}: {
  pieceId: number;
  name: string;
  path?: string;
}): Promise<number> {
  const partId: number = await invoke("parts_add", {
    pieceId,
    name,
    path,
  });

  return partId;
}

export async function partsSetInstruments({
  partId,
  instrumentIds,
}: {
  partId: number;
  instrumentIds: number[];
}) {
  await invoke("parts_set_instruments", {
    partId,
    instrumentIds,
  });
}
