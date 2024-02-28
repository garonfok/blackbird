import { mdiClose, mdiFileOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useAppDispatch } from "@/app/hooks";
import { deleteFile } from "../../filesSlice";
import { ByteFile } from "@/app/types";
import { cleanPiece } from "../../pieceSlice";
import { invoke } from "@tauri-apps/api";

export function Card(props: { file: ByteFile; index: number }) {
  const { file, index } = props;

  const dispatch = useAppDispatch();
  function handleClickDelete() {
    dispatch(deleteFile(index));
    dispatch(cleanPiece(file.id));
  }

  function getFileName(file: string) {
    return file.split("/").pop();
  }

  async function handleDoubleClickOpenFile() {
    await invoke("open", { path: file.name });
  }

  return (
    <span className="border border-fg.2 bg-bg.1 rounded-default px-[14px] py-[8px] flex items-center gap-[14px] w-full">
      <span
        onDoubleClick={handleDoubleClickOpenFile}
        className="flex gap-[14px] truncate w-full"
      >
        <Icon path={mdiFileOutline} size={1} className="shrink-0" />
        <span className="truncate text-left w-full">
          {getFileName(file.name)}
        </span>
      </span>
      <button onClick={handleClickDelete}>
        <Icon path={mdiClose} size={1} className="link" />
      </button>
    </span>
  );
}
