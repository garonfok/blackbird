import { partFormSchema, pieceFormSchema } from "@/routes/Wizard/types";
import { type } from "@tauri-apps/api/os";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

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

export function formatPartNumbers(pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>) {
  const partMap = new Map<string, number>();
  pieceForm.getValues("parts").forEach((part) => {
    const lastSpaceIndex = part.name.lastIndexOf(" ");
    let partName = part.name.substring(0, lastSpaceIndex);
    const partNumber = part.name.substring(lastSpaceIndex + 1);
    if (lastSpaceIndex === -1 || isNaN(Number(partNumber))) {
      partName = part.name;
    }

    if (partMap.has(partName)) {
      partMap.set(partName, partMap.get(partName)! + 1);
    } else {
      partMap.set(partName, 1);
    }
  });

  partMap.forEach((value, key) => {
    if (value === 1) {
      partMap.delete(key);
    }
  });

  const newParts: z.infer<typeof partFormSchema>[] = [];
  for (let i = pieceForm.getValues("parts").length - 1; i >= 0; i--) {
    const lastSpaceIndex = pieceForm.getValues("parts")[i].name.lastIndexOf(" ");
    let partName = pieceForm.getValues("parts")[i].name.substring(0, lastSpaceIndex);
    const partNumber = pieceForm.getValues("parts")[i].name.substring(lastSpaceIndex + 1);
    if (lastSpaceIndex === -1 || isNaN(Number(partNumber))) {
      partName = pieceForm.getValues("parts")[i].name;
    }

    if (partMap.has(partName)) {
      const partNumber = partMap.get(partName)!;
      newParts.unshift({
        ...pieceForm.getValues("parts")[i],
        name: `${partName} ${partNumber}`,
      });
      partMap.set(partName, partNumber - 1);
    } else {
      newParts.unshift({ ...pieceForm.getValues("parts")[i], name: partName });
    }
  }

  pieceForm.setValue("parts", newParts);
}
