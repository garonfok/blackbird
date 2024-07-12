import { Musician } from "@/types";
import { invoke } from "@tauri-apps/api";

export async function musiciansGetAll() {
  const musicians: Musician[] = await invoke("musicians_get_all");

  return musicians;
}

export async function musiciansDelete({ id }: { id: number }) {
  await invoke("musicians_delete", {
    id,
  });
}

export async function musiciansAdd({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName?: string;
}) {
  const musicianId: number = await invoke("musicians_add", {
    firstName,
    lastName,
  });

  return musicianId;
}

export async function musiciansUpdate({
  id,
  firstName,
  lastName,
}: {
  id: number;
  firstName: string;
  lastName?: string;
}) {
  await invoke("musicians_update", {
    id,
    firstName,
    lastName,
  });
}

export async function musiciansGet({ id }: { id: number }) {
  const musician: Musician = await invoke("musicians_get_by_id", {
    id,
  });

  return musician;
}
