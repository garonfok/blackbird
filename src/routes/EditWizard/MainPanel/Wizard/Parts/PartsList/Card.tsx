import { mdiClose, mdiDragVertical, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";
import { useAppDispatch } from "../../../../../../app/hooks";
import { EditPart, Instrument } from "../../../../../../app/types";
import {
  formatPartNumbers,
  pushPartInstrument,
  removePart,
  removePartInstrument,
  setPartInstruments,
  updatePartName,
} from "../../../../pieceSlice";
import { Renameable } from "../../../../../../components/Renameable";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { useState } from "react";
import { SelectInstrumentModal } from "../SelectInstrumentModal";
import { invoke } from "@tauri-apps/api";

export function Card(props: {
  index: number;
  part: EditPart;
  selected: boolean;
}) {
  const [isSelectInstrumentModalOpen, setIsSelectInstrumentModalOpen] =
    useState(false);

  const { index, part, selected } = props;
  const dispatch = useAppDispatch();

  function handleClickRemovePart(index: number) {
    dispatch(removePart(index));
    dispatch(formatPartNumbers());
  }

  function handleSetName(name: string, index: number) {
    dispatch(updatePartName({ index, name }));
  }

  function handleDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.index === destination.index &&
      source.droppableId === destination.droppableId
    )
      return;

    const cloned = [...part.instruments];
    const instrument = cloned[source.index];
    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, instrument);
    dispatch(setPartInstruments({ partIndex: index, instruments: cloned }));
  }

  async function handleConfirmSelectInstrument(instrumentId: number) {
    if (part.instruments.find((i) => i.id === instrumentId)) return;

    const instrument = (await invoke("instruments_get_by_id", {
      id: instrumentId,
    })) as Instrument;

    dispatch(pushPartInstrument({ partIndex: index, instrument }));
  }

  function handleClickRemoveInstrument(instrumentIndex: number) {
    dispatch(removePartInstrument({ partIndex: index, instrumentIndex }));
  }

  return (
    <>
      <div
        className={classNames(
          "flex items-center justify-between px-[14px] py-[8px] rounded-[4px] shadow-float hover:ring-1 ring-fg.default",
          selected ? "bg-bg.emphasis" : "bg-bg.default"
        )}
      >
        <div className="w-full flex items-start gap-[2px]">
          <Icon
            path={mdiDragVertical}
            size={1}
            className="ml-[-10px] text-fg.muted shrink-0"
          />
          <div className="flex flex-col gap-[8px] w-full">
            <Renameable
              index={index}
              isPart={true}
              isRenaming={part.renaming}
              name={part.name}
              setName={handleSetName}
            />
            {part.show && (
              <>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="droppable" direction="vertical">
                    {(provided) => (
                      <div
                        className="w-full p-[4px] bg-bg.inset rounded-[4px] flex flex-col gap-[4px]"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {part.instruments.map((instrument, index) => (
                          <Draggable
                            key={instrument.id}
                            draggableId={instrument.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                key={index}
                                className="flex gap-[4px] items-center border border-fg.subtle rounded-[4px] p-[4px] bg-bg.default"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <div className="flex items-center gap-[4px] w-full">
                                  <Icon path={mdiDragVertical} size={1} />
                                  {instrument.name}
                                </div>
                                <button
                                  onClick={() =>
                                    handleClickRemoveInstrument(index)
                                  }
                                >
                                  <Icon
                                    path={mdiClose}
                                    size={1}
                                    className="text-fg.muted hover:text-fg.default transition-all"
                                  />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <button
                  className="flex gap-[4px] text-fg.muted hover:text-fg.default transition-all"
                  onClick={() => setIsSelectInstrumentModalOpen(true)}
                >
                  <Icon path={mdiPlus} size={1} />
                  Add instrument
                </button>
              </>
            )}
          </div>
        </div>
        <button
          onClick={() => handleClickRemovePart(index)}
          className="self-start"
        >
          <Icon
            path={mdiClose}
            size={1}
            className="text-fg.muted hover:text-fg.default transition-all"
          />
        </button>
      </div>
      <SelectInstrumentModal
        closeModal={() => setIsSelectInstrumentModalOpen(false)}
        isOpen={isSelectInstrumentModalOpen}
        onConfirm={handleConfirmSelectInstrument}
      />
    </>
  );
}
