import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../../../app/hooks";
import { isWindows } from "../../../../../../app/utils";
import { setScoreRenaming, setScores } from "../../../../pieceSlice";
import { Card } from "./Card";
import { ControlledMenu, MenuDivider, MenuItem } from "@szhsin/react-menu";
import { EditScore } from "../../../../../../app/types";

export function ScoresList() {
  const [anchor, setAnchor] = useState<number>(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const piece = useAppSelector((state) => state.piece);
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
  }, [piece.scores]);

  function handleClick(event: globalThis.MouseEvent) {
    event.preventDefault();
    if (
      cardRef.current &&
      !cardRef.current.contains(event.target as Node) &&
      menuRef.current &&
      !menuRef.current.contains(event.target as Node)
    ) {
      setSelected([]);
    }
  }

  async function handleKeyDown(event: globalThis.KeyboardEvent) {
    if (
      (await isWindows()) ? event.ctrlKey && event.key === "a" : event.metaKey
    ) {
      event.preventDefault();
      setSelected([...Array(piece.scores.length).keys()]);
    }
  }

  function handleContextMenu(event: MouseEvent<HTMLDivElement>) {
    if (typeof document.hasFocus === "function" && !document.hasFocus()) return;

    event.preventDefault();
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    setIsContextMenuOpen(true);
  }

  function handleDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    )
      return;

    const cloned = [...piece.scores];
    const score = cloned[source.index];

    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, score);
    dispatch(setScores(cloned));
  }

  function handleClickRename() {
    dispatch(
      setScoreRenaming({
        scoreIndex: selected[0],
        renaming: true,
      })
    );
  }

  function handleClickDelete() {
    dispatch(
      setScores(piece.scores.filter((_, index) => !selected.includes(index)))
    );
  }

  function handleClickMoveUp() {
    const cloned = [...piece.scores];
    for (const index of selected) {
      const part = cloned[index];
      cloned.splice(index, 1);
      cloned.splice(index - 1, 0, part);
    }
    dispatch(setScores(cloned));
    setSelected(selected.map((i) => i - 1));
  }

  function handleClickMoveDown() {
    const cloned = [...piece.scores];
    for (const index of selected) {
      const part = cloned[index];
      cloned.splice(index, 1);
      cloned.splice(index + 1, 0, part);
    }
    dispatch(setScores(cloned));
    setSelected(selected.map((i) => i + 1));
  }

  function handleClickDupeAbove() {
    const cloned = [...piece.scores];
    const dupedParts: EditScore[] = [];
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
    dispatch(setScores(cloned));
  }

  function handleClickDupeBelow() {
    const cloned = [...piece.scores];
    const dupedParts: EditScore[] = [];
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
    dispatch(setScores(cloned));
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
              {piece.scores.map((score, index) => (
                <Draggable
                  key={score.id}
                  draggableId={score.id.toString()}
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
                          score={score}
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
