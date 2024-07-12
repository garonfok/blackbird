import { invoke } from "@tauri-apps/api";
import { WebviewWindow } from "@tauri-apps/api/window";

export async function openWizard({
  pieceId,
  filePaths,
}: {
  pieceId?: number;
  filePaths?: string[];
}) {
  if (pieceId) {
    await invoke("open_wizard", {
      pieceId,
    });
  } else {
    await invoke("open_wizard");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (filePaths) {
      const webviewWizard = WebviewWindow.getByLabel("wizard")!;
      await webviewWizard.emit("file-drop", filePaths);
    }
  }
}

export async function closeWindow({ windowLabel }: { windowLabel: string }) {
  await invoke("close_window", {
    windowLabel,
  });
}
