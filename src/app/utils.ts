import { type } from "@tauri-apps/api/os";

export async function isWindows() {
  return (await type()) === "Windows_NT";
}

export function debounce(fn: Function, timeout = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn(...args);
    }, timeout);
  };
}
