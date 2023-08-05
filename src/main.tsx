import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Dashboard } from "./routes/Dashboard";
import "./styles.css";
import { Settings } from "./routes/Settings";

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
    element: <div>Edit Wizard</div>,
  },
  {
    path: "/edit-wizard/:pieceId",
    element: <div>Edit Wizard but it has a piece</div>,
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="bg-bg.inset text-fg.default w-screen h-screen select-none cursor-default">
      <RouterProvider router={router} />
    </div>
  </React.StrictMode>
);
