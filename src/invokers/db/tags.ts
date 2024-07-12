import { invoke } from "@tauri-apps/api";
import { Tag } from "@/types";

export async function tagsGetAll(): Promise<Tag[]> {
  const tags: Tag[] = await invoke("tags_get_all");

  return tags;
}

export async function tagsDelete({ id }: { id: number }) {
  await invoke("tags_delete", {
    id,
  });
}

export async function tagsAdd({ name }: { name: string }) {
  const tagId: number = await invoke("tags_add", {
    name,
  });

  return tagId;
}

export async function tagsUpdate({ id, name }: { id: number; name: string }) {
  await invoke("tags_update", {
    id,
    name,
  });
}

export async function tagsGet({ id }: { id: number }) {
  const tag: Tag = await invoke("tags_get_by_id", {
    id,
  });

  return tag;
}
