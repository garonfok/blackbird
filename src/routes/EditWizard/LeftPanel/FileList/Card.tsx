import { mdiClose, mdiDragVertical, mdiFileOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useAppDispatch } from "@/app/hooks";
import { deleteFile } from "../../filesSlice";
import { ByteFile } from "@/app/types";
import { cleanPiece } from "../../pieceSlice";
import { invoke } from "@tauri-apps/api";
import { Button } from "@/components/ui/button";

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
    <div className="flex items-center gap-[0px] ml-[-8px]">
      <Icon path={mdiDragVertical} size={1} className="shrink-0 text-fg.2" />
      <span className="border border-divider.default bg-bg.1 rounded-default px-[8px] py-[4px] flex items-center gap-[14px] w-full">
        <span
          onDoubleClick={handleDoubleClickOpenFile}
          className="flex gap-[8px] truncate w-full items-center"
        >
          <Icon path={mdiFileOutline} size={0.667} className="shrink-0" />
          <span className="truncate text-body-default grow w-0">
            {getFileName(file.name)}
          </span>
        </span>
        <Button onClick={handleClickDelete} variant="sidebar" className="p-1">
          <Icon path={mdiClose} size={0.667} />
        </Button>
      </span>
    </div>
  );
}
