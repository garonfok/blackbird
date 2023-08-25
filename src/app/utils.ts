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

export function getContrast(backgroundColor: string, foregroundColor: string) {
  function parseColor(color: string) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luminance = (max + min) / 2;

    return {
      r,
      g,
      b,
      luminance,
    };
  }
  const bg = parseColor(backgroundColor);
  const fg = parseColor(foregroundColor);
  const contrast = (bg.luminance + 0.05) / (fg.luminance + 0.05);
  return contrast;
}
