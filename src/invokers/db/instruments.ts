
import { Instrument } from "@/types";
import { invoke } from "@tauri-apps/api";

export async function instrumentsGetAll() {
  const instruments: Instrument[] = await invoke("instruments_get_all");

  return instruments;
}
