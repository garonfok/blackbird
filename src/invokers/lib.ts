import { invoke } from "@tauri-apps/api";

export async function getWorkingDirectory(): Promise<string> {
  const workingDirectory: string = await invoke("get_working_directory");

  return workingDirectory;
}

export async function getDatabaseExists({
  path,
}: {
  path: string;
}): Promise<boolean> {
  const databaseExists: boolean = await invoke("get_database_exists", {
    path,
  });

  return databaseExists;
}

export async function getDirEmpty({
  path,
}: {
  path: string;
}): Promise<boolean> {
  const isDirEmpty: boolean = await invoke("get_dir_empty", {
    path,
  });

  return isDirEmpty;
}

export async function changeWorkingDirectory({ path }: { path: string }) {
  await invoke("set_working_directory", {
    path,
  });
}

export async function openFolder({ path }: { path: string }) {
  await invoke("open", {
    path,
  });
}
