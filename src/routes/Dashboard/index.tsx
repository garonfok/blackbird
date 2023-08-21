import { Event, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isWindows } from "../../app/utils";
import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";
import { useAppSelector } from "../../app/hooks";

export function Dashboard() {
  const navigate = useNavigate();
  const preview = useAppSelector((state) => state.preview);

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", handleDrop);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      unlisten;
    };
  }, []);

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "n" && ((await isWindows()) ? e.ctrlKey : e.metaKey)) {
      e.preventDefault();
      navigate("/edit-wizard");
    }
  }

  function handleDrop(event: Event<string[]>): void {
    const { payload: files } = event;

    navigate("/edit-wizard", { state: { files } });
  }

  return (
    <div className="flex h-full w-full">
      <LeftPanel />
      <MainPanel />
      {preview.piece && <RightPanel />}
    </div>
  );
}
