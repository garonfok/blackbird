
import { invoke } from "@tauri-apps/api";

export async function scoresAdd({
  pieceId,
  name,
  path,
}: {
  pieceId: number;
  name: string;
  path?: string;
}): Promise<number> {
  const scoreId: number = await invoke("scores_add", {
    pieceId,
    name,
    path,
  });

  return scoreId;
}
