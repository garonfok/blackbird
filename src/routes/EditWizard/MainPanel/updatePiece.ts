import { invoke } from "@tauri-apps/api";
import { EditPiece } from "../../../app/types";
import { createDir, writeBinaryFile } from "@tauri-apps/api/fs";

export async function updatePiece(piece: EditPiece, path: string) {
  await invoke("delete_dir", { path });

  const principalComposer = piece.composers[0];

  const composerName = principalComposer.last_name
    ? `${principalComposer.last_name}, ${principalComposer.first_name}`
    : `${principalComposer.first_name}`;

  const workingDir = await invoke("get_working_directory");

  const newPath = `${workingDir}/${principalComposer.id}_${composerName}/${piece.id}_${piece.title}`;
  await createDir(newPath, { recursive: true });

  await invoke("pieces_update", {
    id: piece.id,
    title: piece.title,
    yearPublished: piece.yearPublished,
    path: newPath,
    difficulty: piece.difficulty,
    notes: piece.notes,
  });

  await invoke("pieces_set_tags", {
    pieceId: piece.id,
    tagIds: piece.tags.map((tag) => tag.id),
  });

  await invoke("pieces_set_musicians", {
    pieceId: piece.id,
    musicianIds: piece.composers.map((composer) => composer.id),
    role: "composer",
  });

  await invoke("pieces_set_musicians", {
    pieceId: piece.id,
    musicianIds: piece.arrangers.map((arranger) => arranger.id),
    role: "arranger",
  });

  await invoke("pieces_set_musicians", {
    pieceId: piece.id,
    musicianIds: piece.transcribers.map((transcriber) => transcriber.id),
    role: "transcriber",
  });

  await invoke("pieces_set_musicians", {
    pieceId: piece.id,
    musicianIds: piece.orchestrators.map((orchestrator) => orchestrator.id),
    role: "orchestrator",
  });

  await invoke("pieces_set_musicians", {
    pieceId: piece.id,
    musicianIds: piece.lyricists.map((lyricist) => lyricist.id),
    role: "lyricist",
  });

  await invoke("pieces_drop_scores", { pieceId: piece.id });
  await invoke("pieces_drop_parts", { pieceId: piece.id });

  for (const [index, score] of piece.scores.entries()) {
    const scorePath =
      score.file && `${path}/${0}.${index + 1}_${score.name}.pdf`;

    await invoke("scores_add", {
      name: score.name,
      path: scorePath,
      pieceId: piece.id,
    });

    // create file
    if (score.file && scorePath) {
      await writeBinaryFile(scorePath, score.file.bytearray);
    }
  }

  for (const [index, part] of piece.parts.entries()) {
    const partPath = part.file && `${path}/${1}.${index + 1}_${part.name}.pdf`;

    const partId = (await invoke("parts_add", {
      name: part.name,
      path: partPath,
      pieceId: piece.id,
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
