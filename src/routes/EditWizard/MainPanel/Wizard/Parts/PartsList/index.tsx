import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useState } from "react";
import {
  useAppDispatch,
  useAppSelector,
} from "../../../../../../app/hooks";
import { ContextMenu } from "../../../../../../components/ContextMenu";
import {
  formatPartNumbers,
  setPartShow,
  setParts,
} from "../../../../pieceSlice";
import { Card } from "./Card";

export function PartsList() {
  const [selected, setSelected] = useState<number[]>([]);

  const parts = useAppSelector((state) => state.piece.parts);
  const dispatch = useAppDispatch();

  function handleContextMenu(
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) {
    event.preventDefault();
    console.log("context menu", index);
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

  function handleClickSelect(index: number) {
    console.log("select", index);
    setSelected([index]);
  }

  function handleClickShow() {
    console.log("hi");
    dispatch(setPartShow({ index: selected[0], show: true }));
  }

  function handleClickRename() {}

  function handleClickDelete() {}

  function handleClickMoveUp() {}

  function handleClickMoveDown() {}

  function handleClickDupeAbove() {}

  function handleClickDupeBelow() {}

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId={"droppable"} direction="vertical">
          {(provided) => (
            <div
              className="flex-grow bg-bg.inset rounded-[4px] px-[14px] py-[8px] flex flex-col overflow-y-auto scrollbar-default"
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
                      onClick={() => handleClickSelect(index)}
                      className="mb-[8px] last:mb-0"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <div
                        onContextMenu={(event) =>
                          handleContextMenu(event, index)
                        }
                      >
                        <Card part={part} index={index} />
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
      {(
        <ContextMenu x={0} y={0}>
          <ContextMenu.Item
            label="Show instruments"
            onClick={handleClickShow}
          />
          <ContextMenu.Item label="Rename" onClick={handleClickRename} />
          <ContextMenu.Item label="Delete" onClick={handleClickDelete} />
          <ContextMenu.Divider />
          <ContextMenu.Item label="Move up" onClick={handleClickMoveUp} />
          <ContextMenu.Item label="Move down" onClick={handleClickMoveDown} />
          <ContextMenu.Divider />
          <ContextMenu.Item
            label="Duplicate above"
            onClick={handleClickDupeAbove}
          />
          <ContextMenu.Item
            label="Duplicate below"
            onClick={handleClickDupeBelow}
          />
        </ContextMenu>
      )}
    </>
  );
}
