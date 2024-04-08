import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ByteFile, Piece } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { open } from "@tauri-apps/api/dialog";
import { Event, listen } from "@tauri-apps/api/event";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ActionCreators } from "redux-undo";
import { pushFiles } from "../filesSlice";
import { setPiece } from "../pieceSlice";
import { useCmdOrCtrlHotkey } from "@/hooks/useHotkey";
import Icon from "@mdi/react";
import { mdiUpload } from "@mdi/js";

export function DragUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isFinishedUploading, setIsFinishedUploading] = useState(false);

  const { state } = useLocation();

  const dispatch = useAppDispatch();
  const files = useAppSelector((state) => state.files);

  const handleDrop = useCallback(async (event: Event<string[]>) => {
    const { payload: files } = event;
    await uploadFiles(files);
  }, []);

  useEffect(() => {
    const unlisten = listen("tauri://file-drop", handleDrop);

    if (state) {
      if (state.files) {
        const { files: dashboardDraggedFiles } = state;
        uploadFiles(dashboardDraggedFiles);
      }

      if (state.piece) {
        const { piece: uploadedPiece }: { piece: Piece } = state;

        const {
          id,
          arrangers,
          composers,
          lyricists,
          notes,
          orchestrators,
          parts,
          scores,
          tags,
          title,
          transcribers,
          difficulty,
          year_published,
        } = uploadedPiece;

        dispatch(
          setPiece({
            id,
            arrangers,
            composers,
            lyricists,
            notes,
            orchestrators,
            parts: parts
              ? parts.map((part) => ({
                ...part,
                show: false,
                renaming: false,
                file: null,
              }))
              : [],
            scores: scores
              ? scores.map((score) => ({
                ...score,
                show: false,
                renaming: false,
                file: null,
              }))
              : [],
            tags,
            title,
            transcribers,
            difficulty,
            yearPublished: year_published,
          })
        );
        dispatch(ActionCreators.clearHistory());

        const partPaths = parts.map((part) => part.path);
        const scorePaths = scores.map((score) => score.path);

        // extract all unique paths that are not undefined
        const paths = [...new Set([...partPaths, ...scorePaths])].filter(
          (path): path is string => !!path
        );

        uploadFiles(paths);
      }
    }

    return () => {
      unlisten;
    };
  }, []);

  async function uploadFiles(selectedFiles: string[]) {
    setTotalFiles(selectedFiles.length);
    setUploadCount(0);
    setIsUploading(true);
    setIsFinishedUploading(false);

    const uploadPromises = selectedFiles.map(async (selectedFile, index) => {
      if (files.some((file) => file.name === selectedFile)) return;
      if (!selectedFile.endsWith(".pdf")) return;

      const buffer = await readBinaryFile(selectedFile);
      const data: ByteFile = {
        id: Math.max(...files.map((file) => file.id), 0) + index + 1,
        name: selectedFile,
        bytearray: buffer,
      };

      setUploadCount((count) => count + 1);

      dispatch(pushFiles({ files: [data] }));
    });

    await Promise.all(uploadPromises);
    toastUploadComplete();

    setIsFinishedUploading(true);
    setTimeout(() => {
      setIsUploading(false);
    }, 5000);
  }

  function toastUploadComplete() {
    toast({
      title: "Finished uploading."
    });
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

  useCmdOrCtrlHotkey("o", handleClickUploadFiles);

  return (
    <div className="px-[14px] flex flex-col gap-[14px]">
      <Button variant="secondary" onClick={handleClickUploadFiles} className="flex items-center gap-[4px] w-fit">
        <Icon path={mdiUpload} size={0.667} />
        <span>Browse files</span>
      </Button>
      {isUploading && (
        <>
          <Progress value={uploadCount / totalFiles * 100} />
          {isFinishedUploading ? <span>Finished uploading</span> : <span>Uploaded {uploadCount} of {totalFiles}</span>}
        </>
      )}
    </div>
  );
}
