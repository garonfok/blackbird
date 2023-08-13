import React, { useCallback } from "react";
import { Provider } from "react-redux";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import store from "./app/store";
import { Dashboard } from "./routes/Dashboard";
import { EditWizard } from "./routes/EditWizard";
import { Settings } from "./routes/Settings";
import "./styles.css";

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
    path: "/edit-wizard",
    element: <EditWizard />,
  },
  {
    path: "/edit-wizard/:pieceId",
    element: <div>Edit Wizard but it has a piece</div>,
  },
]);

export function App() {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.preventDefault();
    },
    []
  );

  return (
    <Provider store={store}>
      <div
        onContextMenu={handleContextMenu}
        className="bg-bg.inset text-fg.default w-screen h-screen select-none cursor-default"
      >
        <RouterProvider router={router} />
      </div>
    </Provider>
  );
}
