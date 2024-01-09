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
        className="bg-bg.0 text-body-default w-screen h-screen select-none cursor-default"
      >
        <RouterProvider router={router} />
      </div>
    </Provider>
  );
}
