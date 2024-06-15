import { useAppSelector } from "@/app/hooks";
import { openWizard } from "@/app/invokers";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Event, listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";

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
    <div className="flex h-full w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <LeftPanel />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <MainPanel />
        </ResizablePanel>
        {preview.piece && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
              <RightPanel />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
