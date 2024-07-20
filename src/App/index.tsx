import { piecesGet } from "@/invokers/db/pieces";
import store from "@/store";
import { getPieceFromDb } from "@/utils/pieces";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Dashboard } from "@/App/routes/Dashboard";
import { Settings } from "@/App/routes/Settings";
import { Wizard } from "@/App/routes/Wizard";
import "@/styles.css";
import React, { useCallback } from "react";
import { Provider } from "react-redux";
import { createBrowserRouter, Params, RouterProvider } from "react-router-dom";
import { DashboardNew } from "./routes/DashboardNew";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/.new",
    element: <DashboardNew />,
  },
  {
    path: "/settings",
    element: <Settings />,
  },
  {
    path: "/wizard",
    element: <Wizard />,
    loader: () => ({}),
  },
  {
    path: "/wizard/:pieceId",
    element: <Wizard />,
    loader: loadWizard,
  },
]);

async function loadWizard({ params }: { params: Params<string> }) {
  const { pieceId } = params;
  if (!pieceId) return;

  const dbPiece = await piecesGet({ id: parseInt(pieceId) });

  const { piece, files } = await getPieceFromDb(dbPiece);

  return {
    piece,
    files,
    pieceId: dbPiece.id,
  };
}

export function App() {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
    },
    [],
  );

  return (
    <Provider store={store}>
      <TooltipProvider>
        <div
          onContextMenu={handleContextMenu}
          className="bg-bg.0 text-fg.0 w-screen h-screen select-none cursor-default"
        >
          <RouterProvider router={router} />
        </div>
        <Toaster />
      </TooltipProvider>
    </Provider>
  );
}
