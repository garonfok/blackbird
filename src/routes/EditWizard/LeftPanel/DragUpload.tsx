import { mdiCheckCircle, mdiClose, mdiLoading, mdiUpload } from "@mdi/js";
import Icon from "@mdi/react";
import { open } from "@tauri-apps/api/dialog";
import { Event, listen } from "@tauri-apps/api/event";
import { readBinaryFile } from "@tauri-apps/api/fs";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { ByteFile, Piece } from "../../../app/types";
import { pushFiles } from "../filesSlice";
import { toast, Toaster } from "react-hot-toast";
import classNames from "classnames";
import { setPiece } from "../pieceSlice";

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
    setIsUploading(true);

    const uploadPromises = selectedFiles.map(async (selectedFile, index) => {
      if (files.some((file) => file.name === selectedFile)) return;
      if (!selectedFile.endsWith(".pdf")) return;

      const buffer = await readBinaryFile(selectedFile);
      const data: ByteFile = {
        id: Math.max(...files.map((file) => file.id), 0) + index + 1,
        name: selectedFile,
        bytearray: buffer,
      };

      dispatch(pushFiles({ files: [data] }));
    });
    await Promise.all(uploadPromises);
    setIsUploading(false);
    toastUploadComplete();
  }

  function toastUploadComplete() {
    toast.custom(
      (t) => (
        <div
          className={classNames(
            "z-auto px-[14px] py-[8px] bg-bg.emphasis rounded-[4px] flex items-center gap-[4px] shadow-float w-[256px]"
          )}
        >
          <div className="flex w-full gap-[4px]">
            <Icon
              path={mdiCheckCircle}
              size={1}
              className="text-success.default shrink-0"
            />
            <span className="text-fg.default">Finished uploading.</span>
          </div>
          <button
            onClick={() => toast.remove(t.id)}
            className="transition-all text-fg.muted hover:text-fg.default"
          >
            <Icon path={mdiClose} size={1} className="shrink-0" />
          </button>
        </div>
      ),
      { id: "uploadConfirm", duration: 3000, position: "bottom-center" }
    );
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

  return (
    <>
      {isUploading ? (
        <div className="w-full items-center inline-flex py-[8px] rounded-[4px] justify-center gap-[8px] bg-brand.default bg-opacity-10 text-fg.muted">
          <Icon
            path={mdiLoading}
            size={1.5}
            className="shrink-0 animate-spin"
          />
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
      )}
      <Toaster />
    </>
  );
}
