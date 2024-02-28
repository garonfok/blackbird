import { useEffect } from "react";
import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";

import { ActionCreators } from "redux-undo";
import { useAppDispatch } from "@/app/hooks";
import { listen } from "@tauri-apps/api/event";
import { ResizablePanelGroup } from "@/components/ui/resizable";

export function EditWizard() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const unlistenUndo = listen<string>("undo", () => {
      dispatch(ActionCreators.undo());
    });
    const unlistenRedo = listen<string>("redo", () => {
      dispatch(ActionCreators.redo());
    });

    return () => {
      unlistenUndo.then((result) => result());
      unlistenRedo.then((result) => result());
    };
  }, []);

  return (
    <ResizablePanelGroup direction="horizontal" className="flex h-full w-full">
      <LeftPanel />
      <MainPanel />
      <RightPanel />
    </ResizablePanelGroup>
  );
}
