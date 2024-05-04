import store from "@/app/store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dashboard } from "@/routes/Dashboard";
import { AppSettings } from "@/routes/AppSettings";
import "@/styles.css";
import { invoke } from "@tauri-apps/api";
import { readBinaryFile } from "@tauri-apps/api/fs";
import React, { useCallback } from "react";
import { Provider } from "react-redux";
import { createBrowserRouter, Params, RouterProvider } from "react-router-dom";
import { z } from "zod";
import { Musician, Piece } from "./app/types";
import { Wizard } from "./routes/Wizard";
import { partFormSchema, pieceFormSchema, scoreFormSchema } from "./routes/Wizard/types";
import { LibSettings } from "./routes/LibrarySettings";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/app-settings",
    element: <AppSettings />,
  },
  {
    path: "/lib-settings",
    element: <LibSettings />
  },
  {
    path: "/wizard",
    element: <Wizard />,
    loader: () => ({})
  },
  {
    path: "/wizard/:pieceId",
    element: <Wizard />,
    loader: loadWizard,
  }
]);

async function loadWizard({ params }: { params: Params<string> }) {
  console.log("loading wizard")
  const { pieceId } = params;
  if (!pieceId) return

  const piece: Piece = await invoke("pieces_get_by_id", { id: Number(pieceId) })

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
    piece: editPiece, files: Array.from(files, ([key, value]) => {
      return {
        id: key,
        name: value.name,
        bytearray: value.file
      }
    }),
    pieceId: Number(pieceId)
  }
}

export function App() {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
    },
    []
  );

  return (
    <Provider store={store}>
      <TooltipProvider>
        <div
          onContextMenu={handleContextMenu}
          className="bg-bg.0 text-body-default w-screen h-screen select-none cursor-default"
        >
          <RouterProvider router={router} />
        </div>
        <Toaster />
      </TooltipProvider>
    </Provider>
  );
}
