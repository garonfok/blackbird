import { partFormSchema, pieceFormSchema } from "@/routes/Wizard/types";
import { invoke } from "@tauri-apps/api";
import { createDir, removeDir, writeBinaryFile } from "@tauri-apps/api/fs";
import { type } from "@tauri-apps/api/os";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Piece } from "./types";
import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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

export async function createPiece(piece: z.infer<typeof pieceFormSchema>) {
  const principalComposer = piece.composers[0];
  const composerName = principalComposer.last_name
    ? `${principalComposer.first_name} ${principalComposer.last_name}`
    : principalComposer.first_name;

  const workingDir = await invoke("get_working_directory")


  const pieceId = (await invoke("pieces_add", {
    title: piece.title,
    yearPublished: piece.yearPublished,
    path: "",
    difficulty: piece.difficulty,
    notes: piece.notes || "",
  })) as number;

  const pathSlash = window.navigator.userAgent.includes("Windows") ? "\\" : "/";
  const path = `${workingDir}${pathSlash}${principalComposer.id}_${composerName}${pathSlash}${pieceId}_${piece.title}`;
  await createDir(path, { recursive: true });

  await invoke("pieces_update", {
    id: pieceId,
    title: piece.title,
    yearPublished: piece.yearPublished,
    path,
    difficulty: piece.difficulty,
    notes: piece.notes || "",
  });

  await invoke("pieces_set_tags", {
    pieceId,
    tagIds: piece.tags.map((tag) => tag.id),
  });
  //  composers
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds: piece.composers.map((composer) => composer.id),
    role: "composer",
  });

  // arrangers
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds: piece.arrangers.map((arranger) => arranger.id),
    role: "arranger",
  });

  // transcribers
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds: piece.transcribers.map((transcriber) => transcriber.id),
    role: "transcriber",
  });

  // orchestrators
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds: piece.orchestrators.map((orchestrator) => orchestrator.id),
    role: "orchestrator",
  });

  // lyricists
  await invoke("pieces_set_musicians", {
    pieceId,
    musicianIds: piece.lyricists.map((lyricist) => lyricist.id),
    role: "lyricist",
  });

  // scores
  for (const [index, score] of piece.scores.entries()) {
    const scorePath =
      score.file && `${path}${pathSlash}${0}.${index + 1}_${score.name}.pdf`;

    await invoke("scores_add", {
      name: score.name,
      path: scorePath,
      pieceId,
    });

    // create file
    if (score.file && scorePath) {
      await writeBinaryFile(scorePath, score.file.bytearray);
    }
  }

  // parts
  for (const [index, part] of piece.parts.entries()) {
    const partPath =
      part.file && `${path}${pathSlash}${1}.${index + 1}_${part.name}.pdf`;

    const partId = (await invoke("parts_add", {
      name: part.name,
      path: partPath,
      pieceId,
    })) as number;

    // instruments
    await invoke("parts_set_instruments", {
      partId,
      instrumentIds: part.instruments.map((instrument) => instrument.id),
    });

    // create file
    if (part.file && partPath) {
      await writeBinaryFile(partPath, part.file.bytearray);
    }
  }
}

export async function updatePiece(piece: z.infer<typeof pieceFormSchema>, id: number) {

  const originalPiece: Piece = await invoke("pieces_get_by_id", { id });
  const originalPath = originalPiece.path;

  const principalComposer = piece.composers[0];
  const composerName = principalComposer.last_name
    ? `${principalComposer.first_name} ${principalComposer.last_name}`
    : principalComposer.first_name;

  const workingDir = await invoke("get_working_directory")
  const pathSlash = window.navigator.userAgent.includes("Windows") ? "\\" : "/";
  const path = `${workingDir}${pathSlash}${principalComposer.id}_${composerName}${pathSlash}${id}_${piece.title}`;

  await removeDir(originalPath, { recursive: true });
  await createDir(path, { recursive: true });

  await invoke("pieces_update", {
    id,
    title: piece.title,
    yearPublished: piece.yearPublished,
    path,
    difficulty: piece.difficulty,
    notes: piece.notes || "",
  });

  await invoke("pieces_set_tags", {
    pieceId: id,
    tagIds: piece.tags.map((tag) => tag.id),
  });
  //  composers
  await invoke("pieces_set_musicians", {
    pieceId: id,
    musicianIds: piece.composers.map((composer) => composer.id),
    role: "composer",
  });

  // arrangers
  await invoke("pieces_set_musicians", {
    pieceId: id,
    musicianIds: piece.arrangers.map((arranger) => arranger.id),
    role: "arranger",
  });

  // transcribers
  await invoke("pieces_set_musicians", {
    pieceId: id,
    musicianIds: piece.transcribers.map((transcriber) => transcriber.id),
    role: "transcriber",
  });

  // orchestrators
  await invoke("pieces_set_musicians", {
    pieceId: id,
    musicianIds: piece.orchestrators.map((orchestrator) => orchestrator.id),
    role: "orchestrator",
  });

  // lyricists
  await invoke("pieces_set_musicians", {
    pieceId: id,
    musicianIds: piece.lyricists.map((lyricist) => lyricist.id),
    role: "lyricist",
  });

  // delete all scores
  await invoke("pieces_drop_scores", { pieceId: id });

  // scores
  for (const [index, score] of piece.scores.entries()) {
    const scorePath =
      score.file && `${path}${pathSlash}${0}.${index + 1}_${score.name}.pdf`;

    await invoke("scores_add", {
      name: score.name,
      path: scorePath,
      pieceId: id,
    });

    // create file
    if (score.file && scorePath) {
      await writeBinaryFile(scorePath, score.file.bytearray);
    }
  }

  // delete all parts
  await invoke("pieces_drop_parts", { pieceId: id });

  // parts
  for (const [index, part] of piece.parts.entries()) {
    const partPath =
      part.file && `${path}${pathSlash}${1}.${index + 1}_${part.name}.pdf`;

    const partId = (await invoke("parts_add", {
      name: part.name,
      path: partPath,
      pieceId: id,
    })) as number;

    // instruments
    await invoke("parts_set_instruments", {
      partId,
      instrumentIds: part.instruments.map((instrument) => instrument.id),
    });

    // create file
    if (part.file && partPath) {
      await writeBinaryFile(partPath, part.file.bytearray);
    }
  }
}
