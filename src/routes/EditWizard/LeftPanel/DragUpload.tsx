import { mdiLoading, mdiUpload } from "@mdi/js";
import Icon from "@mdi/react";
import { open } from "@tauri-apps/api/dialog";
import { listen, Event } from "@tauri-apps/api/event";
import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { pushFiles } from "../filesSlice";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { ByteFile } from "../../../app/types";
import { useLocation } from "react-router-dom";

export function DragUpload(props: { isPanelSmall: boolean }) {
  const { isPanelSmall } = props;
  const [isUploading, setIsUploading] = useState(false);

  const { state } = useLocation();

  const dispatch = useAppDispatch();
  const files = useAppSelector((state) => state.files);

  const handleDrop = useCallback(async (event: Event<string[]>) => {
    const { payload: files } = event;
    await uploadFiles(files);
  }, []);

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", handleDrop);

    if (!state) return;
    const { files: dashboardDraggedFiles } = state;
    uploadFiles(dashboardDraggedFiles);

    return () => {
      unlisten;
    };
  }, []);

  async function uploadFiles(selectedFiles: string[]) {
    setIsUploading(true);

    const uploadPromises = selectedFiles.map(async (selectedFile) => {
      if (files.some((file) => file.name === selectedFile)) return;
      if (!selectedFile.endsWith(".pdf")) return;

      const buffer = await readBinaryFile(selectedFile);
      const data: ByteFile = {
        name: selectedFile,
        bytearray: buffer,
      };

      dispatch(pushFiles({ files: [data] }));
    });
    await Promise.all(uploadPromises);
    setIsUploading(false);
  }

  const handleClickUploadFiles = useCallback(async () => {
    const selectedFiles = await open({
      multiple: true,
      filters: [
        {
          name: "PDF",
          extensions: ["pdf"],
        },
      ],
    });

    if (!selectedFiles) return;
    await uploadFiles(selectedFiles as string[]);
  }, []);

  return isUploading ? (
    <div className="w-full items-center inline-flex py-[8px] rounded-[4px] justify-center gap-[8px] bg-brand.default bg-opacity-10 text-fg.muted">
      <Icon path={mdiLoading} size={1.5} className="shrink-0 animate-spin" />
      <span>{!isPanelSmall ? "Uploading files" : "Uploading..."}</span>
    </div>
  ) : (
    <button
      onClick={handleClickUploadFiles}
      className="w-full items-center border-dashed inline-flex border border-brand.default py-[8px] rounded-[4px] justify-center gap-[8px] bg-brand.default bg-opacity-10 text-fg.muted hover:text-fg.default transition-all"
    >
      <Icon path={mdiUpload} size={1.5} className="shrink-0" />
      <span>
        {!isPanelSmall ? "Drag and drop PDFs, or browse" : "Upload PDFs"}
      </span>
    </button>
  );
}
