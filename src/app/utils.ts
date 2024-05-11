import { partFormSchema, pieceFormSchema, scoreFormSchema } from "@/routes/Wizard/types";
import { createDir, readBinaryFile, removeDir, writeBinaryFile } from "@tauri-apps/api/fs";
import { type } from "@tauri-apps/api/os";
import clsx, { ClassValue } from "clsx";
import { UseFormReturn } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { z } from "zod";
import { getWorkingDirectory, partsAdd, partsSetInstruments, piecesAdd, piecesDropParts, piecesDropScores, piecesGet, piecesSetMusicians, piecesSetTags, piecesUpdate, scoresAdd } from "./invokers";
import { Musician, Piece } from "./types";

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

  const composerName = [principalComposer.last_name, principalComposer.first_name].filter(Boolean).join(", ")

  const workingDir = await getWorkingDirectory()

  const pieceId = await piecesAdd({
    title: piece.title,
    yearPublished: piece.yearPublished,
    path: "",
    difficulty: piece.difficulty,
    notes: piece.notes || "",
  })

  const pathSlash = window.navigator.userAgent.includes("Windows") ? "\\" : "/";
  const path = `${workingDir}${pathSlash}${principalComposer.id}_${composerName}${pathSlash}${pieceId}_${piece.title}`;
  await createDir(path, { recursive: true });

  await piecesUpdate({
    id: pieceId,
    title: piece.title,
    yearPublished: piece.yearPublished,
    path,
    difficulty: piece.difficulty,
    notes: piece.notes || "",
  })

  await piecesSetTags({
    pieceId,
    tagIds: piece.tags.map((tag) => tag.id),
  });

  //  composers
  await piecesSetMusicians({
    pieceId,
    musicianIds: piece.composers.map((composer) => composer.id),
    role: "composer",
  })

  // arrangers
  await piecesSetMusicians({
    pieceId,
    musicianIds: piece.arrangers.map((arranger) => arranger.id),
    role: "arranger",
  });


  // transcribers
  await piecesSetMusicians({
    pieceId,
    musicianIds: piece.transcribers.map((transcriber) => transcriber.id),
    role: "transcriber",
  });

  // orchestrators
  await piecesSetMusicians({
    pieceId,
    musicianIds: piece.orchestrators.map((orchestrator) => orchestrator.id),
    role: "orchestrator",
  });

  // lyricists
  await piecesSetMusicians({
    pieceId,
    musicianIds: piece.lyricists.map((lyricist) => lyricist.id),
    role: "lyricist",
  });

  // scores
  for (const [index, score] of piece.scores.entries()) {
    const scorePath =
      score.file && `${path}${pathSlash}${0}.${index + 1}_${score.name}.pdf`;

    await scoresAdd({
      pieceId,
      name: score.name,
      path: scorePath,
    })

    // create file
    if (score.file && scorePath) {
      await writeBinaryFile(scorePath, score.file.bytearray);
    }
  }

  // parts
  for (const [index, part] of piece.parts.entries()) {
    const partPath =
      part.file && `${path}${pathSlash}${1}.${index + 1}_${part.name}.pdf`;

    const partId = await partsAdd({
      name: part.name,
      path: partPath,
      pieceId,
    })

    await partsSetInstruments({
      partId,
      instrumentIds: part.instruments.map((instrument) => instrument.id),
    })

    // create file
    if (part.file && partPath) {
      await writeBinaryFile(partPath, part.file.bytearray);
    }
  }
}

export async function updatePiece(piece: z.infer<typeof pieceFormSchema>, id: number) {

  const originalPiece = await piecesGet({ id });
  const originalPath = originalPiece.path;

  const principalComposer = piece.composers[0];

  const composerName = [principalComposer.last_name, principalComposer.first_name].filter(Boolean).join(", ")

  const workingDir = await getWorkingDirectory()
  const pathSlash = window.navigator.userAgent.includes("Windows") ? "\\" : "/";
  const path = `${workingDir}${pathSlash}${principalComposer.id}_${composerName}${pathSlash}${id}_${piece.title}`;

  try {
    await removeDir(originalPath, { recursive: true });
  } catch (error) {
    console.error(error);
  }
  try {
    await createDir(path, { recursive: true });
  } catch (error) {
    console.error(error);
  }

  await piecesUpdate({
    id,
    title: piece.title,
    yearPublished: piece.yearPublished,
    path,
    difficulty: piece.difficulty,
    notes: piece.notes || "",
  });

  await piecesSetTags({
    pieceId: id,
    tagIds: piece.tags.map((tag) => tag.id),
  });
  //  composers
  await piecesSetMusicians({
    pieceId: id,
    musicianIds: piece.composers.map((composer) => composer.id),
    role: "composer",
  });

  // arrangers

  await piecesSetMusicians({
    pieceId: id,
    musicianIds: piece.arrangers.map((arranger) => arranger.id),
    role: "arranger",
  });

  // transcribers

  await piecesSetMusicians({
    pieceId: id,
    musicianIds: piece.transcribers.map((transcriber) => transcriber.id),
    role: "transcriber",
  });

  // orchestrators

  await piecesSetMusicians({
    pieceId: id,
    musicianIds: piece.orchestrators.map((orchestrator) => orchestrator.id),
    role: "orchestrator",
  });

  // lyricists

  await piecesSetMusicians({
    pieceId: id,
    musicianIds: piece.lyricists.map((lyricist) => lyricist.id),
    role: "lyricist",
  });

  // delete all scores
  await piecesDropScores({ id });

  // scores
  for (const [index, score] of piece.scores.entries()) {
    const scorePath =
      score.file && `${path}${pathSlash}${0}.${index + 1}_${score.name}.pdf`;

    await scoresAdd({
      pieceId: id,
      name: score.name,
      path: scorePath,
    });

    // create file
    if (score.file && scorePath) {
      await writeBinaryFile(scorePath, score.file.bytearray);
    }
  }

  // delete all parts
  await piecesDropParts({ id });

  // parts
  for (const [index, part] of piece.parts.entries()) {
    const partPath =
      part.file && `${path}${pathSlash}${1}.${index + 1}_${part.name}.pdf`;

    const partId = await partsAdd({
      name: part.name,
      path: partPath,
      pieceId: id,
    });

    // instruments
    await partsSetInstruments({
      partId,
      instrumentIds: part.instruments.map((instrument) => instrument.id),
    });

    // create file
    if (part.file && partPath) {
      await writeBinaryFile(partPath, part.file.bytearray);
    }
  }
}

export async function getPieceFromDb(piece: Piece) {
  let files = new Map<number, { name: string, file: Uint8Array }>()
  let maxId = -1

  const parts: z.infer<typeof partFormSchema>[] = await Promise.all(piece.parts.map(async part => {
    const filePath = part.path
    if (filePath) {
      const buffer = await readBinaryFile(filePath)
      files.set(++maxId, {
        name: filePath.split("/").pop() || "",
        file: buffer
      })
    }
    return {
      id: part.id,
      name: part.name,
      instruments: part.instruments,
      file: filePath ? {
        id: maxId,
        name: files.get(maxId)!.name,
        bytearray: files.get(maxId)!.file,
      } : undefined
    }
  }))

  const scores: z.infer<typeof scoreFormSchema>[] = await Promise.all(piece.scores.map(async score => {
    const filePath = score.path
    if (filePath) {
      const buffer = await readBinaryFile(filePath)
      files.set(++maxId, {
        name: filePath.split("/").pop() || "",
        file: buffer
      })
    }
    return {
      id: score.id,
      name: score.name,
      file: filePath ? {
        id: maxId,
        name: files.get(maxId)!.name,
        bytearray: files.get(maxId)!.file,
      } : undefined
    }
  }))

  const editPiece: z.infer<typeof pieceFormSchema> = {
    title: piece.title,
    yearPublished: piece.year_published,
    difficulty: piece.difficulty,
    notes: piece.notes,
    tags: piece.tags,
    composers: piece.composers as [Musician, ...Musician[]],
    arrangers: piece.arrangers,
    orchestrators: piece.orchestrators,
    transcribers: piece.transcribers,
    lyricists: piece.lyricists,
    parts,
    scores,
  }

  return {
    piece: editPiece,
    files: Array.from(files, ([key, value]) => {
      return {
        id: key,
        name: value.name,
        bytearray: value.file
      }
    }),
    pieceId: Number(piece.id)
  }

}
