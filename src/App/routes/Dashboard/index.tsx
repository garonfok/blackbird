import { useAppSelector } from "@/hooks/store";
import { openWizard } from "@/invokers/window";
import { Event, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";
import { Sidebar } from "@/components/Sidebar";

export function Dashboard() {
  const navigate = useNavigate();
  const preview = useAppSelector((state) => state.preview);

  useEffect(() => {
    const unlistenFileDrop = listen("tauri://file-drop", handleDrop);
    const unlistenNavigateSettings = listen("settings", () =>
      navigate("/settings"),
    );
    return () => {
      unlistenFileDrop;
      unlistenNavigateSettings;
    };
  }, []);

  async function handleDrop(event: Event<string[]>) {
    const { payload: files } = event;

    await openWizard({ filePaths: files });
  }

  return (
    <div className="flex h-screen w-screen">
      <button onClick={() => navigate("/.new")}>New</button>
      <Sidebar direction="left">
        <LeftPanel />
      </Sidebar>
      <MainPanel />
      {preview.piece && (
        <Sidebar direction="right">
          <RightPanel />
        </Sidebar>
      )}
    </div>
  );
}
