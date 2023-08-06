import React from "react";
import ReactDOM from "react-dom/client";
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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <div className="bg-bg.inset text-fg.default w-screen h-screen select-none cursor-default">
        <RouterProvider router={router} />
      </div>
    </Provider>
  </React.StrictMode>
);
