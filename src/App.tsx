import { piecesGet } from "@/app/invokers";
import store from "@/app/store";
import { getPieceFromDb } from "@/app/utils";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dashboard } from "@/routes/Dashboard";
import { Settings } from "@/routes/Settings";
import { Wizard } from "@/routes/Wizard";
import "@/styles.css";
import React, { useCallback } from "react";
import { Provider } from "react-redux";
import { createBrowserRouter, Params, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/settings",
    element: <Settings />,
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
  const { pieceId } = params;
  if (!pieceId) return

  const dbPiece = await piecesGet({ id: Number(pieceId) })

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
