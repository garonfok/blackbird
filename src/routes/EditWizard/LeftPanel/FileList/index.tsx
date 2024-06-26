import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { deleteFile, setFiles } from "../../filesSlice";
import { Card } from "./Card";
import { MouseEvent, useRef, useState } from "react";
import { ControlledMenu, MenuItem } from "@szhsin/react-menu";
import { ByteFile } from "@/app/types";
import { cleanPiece } from "../../pieceSlice";
import { invoke } from "@tauri-apps/api";
import { Label } from "@/components/ui/label";

export function FileList() {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: ByteFile;
    index: number;
  }>();

  const files = useAppSelector((state) => state.files);
  const dispatch = useAppDispatch();

  const menuRef = useRef<HTMLDivElement>(null);

  function handleDragEnd(result: DropResult) {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const cloned = [...files];
    const file = cloned[source.index];
    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, file);

    dispatch(setFiles({ files: cloned }));
  }

  function handleContextMenu(
    event: MouseEvent<HTMLDivElement>,
    file: ByteFile,
    index: number
  ) {
    if (typeof document.hasFocus === "function" && !document.hasFocus()) return;
    event.preventDefault();
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    setIsContextMenuOpen(true);
    setSelectedFile({ file, index });
  }

  async function handleClickOpenFile() {
    await invoke("open", { path: selectedFile!.file.name });
  }

  function handleClickOpenContainingDirectory() {
    const fileName = selectedFile!.file.name;
    const directoryPath = fileName.substring(0, fileName.lastIndexOf("/"));
    invoke("open", { path: directoryPath });
  }

  function handleClickRemove() {
    dispatch(deleteFile(selectedFile!.index));
    dispatch(cleanPiece(selectedFile!.file.id));
  }

  return (
    <div className="flex flex-col px-[14px] gap-[14px] h-full">
      <Label>Files</Label>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={"dropppable"} direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex flex-col flex-grow overflow-y-auto scrollbar-default"
            >
              {files.map((file, index) => (
                <Draggable
                  key={file.id}
                  draggableId={file.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className="mb-[4px] last:mb-0"
                      onContextMenu={(event) =>
                        handleContextMenu(event, file, index)
                      }
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card file={file} index={index} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
      <ControlledMenu
        anchorPoint={anchorPoint}
        state={isContextMenuOpen ? "open" : "closed"}
        direction="right"
        onClose={() => {
          setIsContextMenuOpen(false);
          setSelectedFile(undefined);
        }}
      >
        <div ref={menuRef} className="dropdown">
          <MenuItem
            onClick={() => handleClickOpenFile()}
            className="dropdown-item"
          >
            Open file
          </MenuItem>
          <MenuItem
            onClick={() => handleClickOpenContainingDirectory()}
            className="dropdown-item"
          >
            Open containing directory
          </MenuItem>
          <MenuItem
            onClick={() => handleClickRemove()}
            className="dropdown-item text-error.default"
          >
            Remove
          </MenuItem>
        </div>
      </ControlledMenu>
    </div>
  );
}
