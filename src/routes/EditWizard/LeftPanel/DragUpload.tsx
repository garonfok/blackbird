import { mdiUpload } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../../app/hooks";
import { pushFiles } from "../filesSlice";

export function DragUpload(props: { isPanelSmall: boolean }) {
  const { isPanelSmall } = props;

  const dispatch = useAppDispatch();

  useEffect(() => {
    window.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    window.addEventListener("drop", (event) => {
      event.preventDefault();
      if (!event.dataTransfer) return;

      const { files: newFiles } = event.dataTransfer;
      uploadFiles(newFiles);
    });
    return () => {
      window.removeEventListener("dragover", () => {});
      window.removeEventListener("drop", () => {});
    };
  }, []);

  const inputRef = useRef<HTMLInputElement>(null);

  function uploadFiles(uploadedFiles: FileList) {
    if (!uploadedFiles) return;

    dispatch(pushFiles({ files: Array.from(uploadedFiles) }));
  }

  function handleClickUploadFiles() {
    inputRef.current?.click();
  }

  function handleChangeUploadFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const { files: uploadedFiles } = event.target;
    if (!uploadedFiles) return;
    uploadFiles(uploadedFiles);
  }

  return (
    <>
      <input
        type="file"
        multiple
        accept=".pdf"
        onChange={handleChangeUploadFiles}
        className="hidden"
        ref={inputRef}
      />
      <button
        onClick={handleClickUploadFiles}
        className="w-full items-center border-dashed inline-flex border border-brand.default py-[8px] rounded-[4px] justify-center gap-[8px] bg-brand.default bg-opacity-10 text-fg.muted hover:text-fg.default transition-all"
      >
        <Icon path={mdiUpload} size={1.5} className="shrink-0" />
        <span>
          {!isPanelSmall ? "Drag and drop PDFs, or browse" : "Upload PDFs"}
        </span>
      </button>
    </>
  );
}
