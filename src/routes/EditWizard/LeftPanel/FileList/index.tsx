import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { setFiles } from "../../filesSlice";
import { Card } from "./Card";

export function FileList() {
  const files = useAppSelector((state) => state.files);
  const dispatch = useAppDispatch();

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

  return (
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
                    className="mb-[8px] last:mb-0"
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
  );
}
