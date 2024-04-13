import { useAppSelector } from "@/app/hooks";
import { ResizablePanelGroup } from "@/components/ui/resizable";
import { useCmdOrCtrlHotkey } from "@/hooks/useHotkey";
import { Event, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";

export function Dashboard() {
  const navigate = useNavigate();
  const preview = useAppSelector((state) => state.preview);

  useCmdOrCtrlHotkey("n", () => navigate("/wizard"));

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", handleDrop);
    return () => {
      unlisten;
    };
  }, []);

  function handleDrop(event: Event<string[]>): void {
    const { payload: files } = event;

    navigate("/edit-wizard", { state: { files } });
  }

  return (
    <div className="flex h-full w-full">
      <ResizablePanelGroup direction="horizontal">
        <LeftPanel />
        <MainPanel />
        {preview.piece && <RightPanel />}
      </ResizablePanelGroup>
    </div>
  );
}
