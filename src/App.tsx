import store from "@/app/store";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSettings } from "@/routes/AppSettings";
import { Dashboard } from "@/routes/Dashboard";
import "@/styles.css";
import { invoke } from "@tauri-apps/api";
import React, { useCallback } from "react";
import { Provider } from "react-redux";
import { createBrowserRouter, Params, RouterProvider } from "react-router-dom";
import { Piece } from "./app/types";
import { LibSettings } from "./routes/LibrarySettings";
import { Wizard } from "./routes/Wizard";
import { getPieceFromDb } from "./app/utils";

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

  const dbPiece: Piece = await invoke("pieces_get_by_id", { id: Number(pieceId) })

  const { piece, files } = await getPieceFromDb(dbPiece)

  return {
    piece,
    files,
    pieceId: dbPiece.id
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
