import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { ControlledMenu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { EditPart } from "src/app/types";
import { isWindows } from "src/app/utils";
import {
  formatPartNumbers,
  setPartRenaming,
  setPartShow,
  setParts,
} from "../../../../pieceSlice";
import { Card } from "./Card";

export function PartsList() {
  const [anchor, setAnchor] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [partsClipboard, setPartsClipboard] = useState<EditPart[]>([]);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const parts = useAppSelector((state) => state.piece.parts);
  const dispatch = useAppDispatch();

  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [parts, selected, partsClipboard]);

  async function handleKeyDown(event: globalThis.KeyboardEvent) {
    event.preventDefault();
    setIsContextMenuOpen(false);
    if ((await isWindows()) ? event.ctrlKey : event.metaKey) {
      switch (event.key) {
        case "a":
          setSelected([...Array(parts.length).keys()]);
          break;
        case "c":
          setPartsClipboard(
            parts.filter((_, index) => selected.includes(index))
          );
          break;
        case "v":
          const cloned = [...parts];
          const index =
            selected.length > 0 ? selected[selected.length - 1] : cloned.length;
          const pasted = partsClipboard.map((part, index) => ({
            ...part,
            id: Math.max(...parts.map((p) => p.id), 0) + index + 1,
          }));
          cloned.splice(index + 1, 0, ...pasted);
          dispatch(setParts(cloned));
          dispatch(formatPartNumbers());
          break;
      }
    } else {
      switch (event.key) {
        case "Backspace":
          dispatch(
            setParts(parts.filter((_, index) => !selected.includes(index)))
          );
          dispatch(formatPartNumbers());
          break;
        default:
      }
    }
  }

  async function handleClickSelect(
    event: MouseEvent<HTMLDivElement>,
    index: number
  ) {
    if ((await isWindows()) ? event.ctrlKey : event.metaKey) {
      if (selected.includes(index)) {
        setSelected(selected.filter((i) => i !== index));
        const nextGreatestIndex = selected
          .filter((i) => i < index)
          .sort((a, b) => b - a)[0];
        setAnchor(nextGreatestIndex || 0);
      } else {
        setAnchor(index);
        setSelected([...selected, index]);
      }
    } else if (event.shiftKey) {
      const min = Math.min(anchor, index);
      const max = Math.max(anchor, index);
      setSelected([...Array(max - min + 1).keys()].map((i) => i + min));
      setAnchor(index);
    } else {
      setSelected([index]);
      setAnchor(index);
    }
  }

  function handleClick(event: globalThis.MouseEvent) {
    if (
      cardRef.current &&
      !cardRef.current.contains(event.target as Node) &&
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setSelected([]);
    }
  }

  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (typeof document.hasFocus === "function" && !document.hasFocus()) return;
    event.preventDefault();
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    setIsContextMenuOpen(true);
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const cloned = [...parts];
    const file = cloned[source.index];
    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, file);

    dispatch(setParts(cloned));
    dispatch(formatPartNumbers());
  }

  function handleClickShow() {
    for (const index of selected) {
      dispatch(setPartShow({ index, show: true }));
    }
  }

  function handleClickHide() {
    for (const index of selected) {
      dispatch(setPartShow({ index, show: false }));
    }
  }

  function handleClickRename() {
    dispatch(setPartRenaming({ partIndex: selected[0], renaming: true }));
  }

  function handleClickDelete() {
    dispatch(setParts(parts.filter((_, index) => !selected.includes(index))));
    dispatch(formatPartNumbers());
  }

  function handleClickMoveUp() {
    const cloned = [...parts];
    for (const index of selected) {
      const part = cloned[index];
      cloned.splice(index, 1);
      cloned.splice(index - 1, 0, part);
    }
    dispatch(setParts(cloned));
    dispatch(formatPartNumbers());
    setSelected(selected.map((i) => i - 1));
  }

  function handleClickMoveDown() {
    const cloned = [...parts];
    for (const index of selected) {
      const part = cloned[index];
      cloned.splice(index, 1);
      cloned.splice(index + 1, 0, part);
    }
    dispatch(setParts(cloned));
    dispatch(formatPartNumbers());
    setSelected(selected.map((i) => i + 1));
  }

  function handleClickDupeAbove() {
    const cloned = [...parts];
    const dupedParts: EditPart[] = [];
    for (const index of selected) {
      const highestId =
        Math.max(...cloned.map((part) => part.id)) +
        Math.max(...dupedParts.map((part) => part.id), 0);
      dupedParts.push({
        ...cloned[index],
        id: highestId + 1,
      });
    }
    const lowestIndex = Math.min(...selected);
    cloned.splice(lowestIndex, 0, ...dupedParts);
    dispatch(setParts(cloned));
    dispatch(formatPartNumbers());
  }

  function handleClickDupeBelow() {
    const cloned = [...parts];
    const dupedParts: EditPart[] = [];
    for (const index of selected) {
      const highestId =
        Math.max(...cloned.map((part) => part.id)) +
        Math.max(...dupedParts.map((part) => part.id), 0);
      dupedParts.push({
        ...cloned[index],
        id: highestId + 1,
      });
    }
    const highestIndex = Math.max(...selected);
    cloned.splice(highestIndex + 1, 0, ...dupedParts);
    dispatch(setParts(cloned));
    dispatch(formatPartNumbers());
  }

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={"droppable"} direction="vertical">
          {(provided) => (
            <div
              className="flex-grow bg-bg.inset rounded-[4px] p-[8px] flex flex-col overflow-y-auto scrollbar-default"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {parts.map((part, index) => (
                <Draggable
                  key={part.id}
                  draggableId={part.id.toString()}
                  index={index}
                >
                  {(provided) => (
                    <div
                      onClick={(event) => handleClickSelect(event, index)}
                      className="mb-[8px] last:mb-0"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div onContextMenu={handleContextMenu} ref={cardRef}>
                        <Card
                          part={part}
                          index={index}
                          selected={selected.includes(index)}
                        />
                      </div>
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
        onClose={() => setIsContextMenuOpen(false)}
      >
        <div
          ref={menuRef}
          className="flex flex-col w-[192px] p-[4px] rounded-[4px] absolute bg-bg.inset shadow-float"
        >
          {selected.length === 1 && (
            <>
              <MenuItem
                className="context-menu-item"
                onClick={handleClickRename}
              >
                Rename
              </MenuItem>
              <MenuDivider className="context-menu-divider" />
            </>
          )}
          {parts
            .filter((_, index) => selected.includes(index))
            .some((part) => part.show) ? (
            <MenuItem className="context-menu-item" onClick={handleClickHide}>
              Hide instruments
            </MenuItem>
          ) : (
            <MenuItem className="context-menu-item" onClick={handleClickShow}>
              Show instruments
            </MenuItem>
          )}
          <MenuItem className="context-menu-item" onClick={handleClickDelete}>
            Delete
          </MenuItem>
          <MenuDivider className="context-menu-divider" />
          <MenuItem className="context-menu-item" onClick={handleClickMoveUp}>
            Move up
          </MenuItem>
          <MenuItem className="context-menu-item" onClick={handleClickMoveDown}>
            Move down
          </MenuItem>
          <MenuItem
            className="context-menu-item"
            onClick={handleClickDupeAbove}
          >
            Duplicate above
          </MenuItem>
          <MenuItem
            className="context-menu-item"
            onClick={handleClickDupeBelow}
          >
            Duplicate below
          </MenuItem>
        </div>
      </ControlledMenu>
    </>
  );
}
