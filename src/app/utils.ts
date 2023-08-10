import { type } from "@tauri-apps/api/os";

export async function isWindows() {
  return (await type()) === "Windows_NT";
}
