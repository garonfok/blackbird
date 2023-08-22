import { invoke } from "@tauri-apps/api";
import { createDir, writeBinaryFile } from "@tauri-apps/api/fs";
import { EditPiece } from "../../../app/types";

export async function createPiece(piece: EditPiece) {
  console.log(piece);

  const principalComposer = piece.composers[0];

  const composerName = principalComposer.last_name
    ? `${principalComposer.last_name}, ${principalComposer.first_name}`
    : `${principalComposer.first_name}`;

  const workingDir = await invoke("get_working_directory");

  const lastPieceId = (await invoke("pieces_get_max_id")) as number | null;

  const newId = (lastPieceId ?? 0) + 1;

  const path = `${workingDir}/${principalComposer.id}_${composerName}/${newId}_${piece.title}`;

  await createDir(path, { recursive: true });

  const pieceId = (await invoke("pieces_add", {
    title: piece.title,
    yearPublished: piece.yearPublished,
    path,
    difficulty: piece.difficulty,
    notes: piece.notes,
  })) as number;

  // tags
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
    const scorePath = score.file && `${path}/${0}.${index}_${score.name}.pdf`;

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
    const partPath = part.file && `${path}/${1}.${index}_${part.name}.pdf`;

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
