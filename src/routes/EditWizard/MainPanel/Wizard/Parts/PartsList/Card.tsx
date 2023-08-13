import { mdiClose, mdiDragVertical } from "@mdi/js";
import Icon from "@mdi/react";
import { useAppDispatch } from "../../../../../../app/hooks";
import { EditPart } from "../../../../../../app/types";
import {
  formatPartNumbers,
  removePart,
  updatePartName,
} from "../../../../pieceSlice";
import { Renameable } from "./Renameable";

export function Card(props: { index: number; part: EditPart }) {
  const { index, part } = props;
  const dispatch = useAppDispatch();

  function handleClickRemovePart(index: number) {
    dispatch(removePart(index));
    dispatch(formatPartNumbers());
  }

  function handleSetName(name: string, index: number) {
    dispatch(updatePartName({ index, name }));
  }

  return (
    <div className="flex items-center justify-between bg-bg.default px-[14px] py-[8px] rounded-[4px] shadow-float">
      <div className="w-full flex items-start gap-[2px]">
        <Icon
          path={mdiDragVertical}
          size={1}
          className="ml-[-10px] text-fg.muted"
        />
        <div className="flex flex-col gap-[8px]">
          <Renameable index={index} name={part.name} setName={handleSetName} />
          {part.show && part.instruments.map((instrument, index) => (
            <div key={index} className="text-fg.muted">
              {instrument.name}
            </div>
          ))}
        </div>
      </div>
      <button onClick={() => handleClickRemovePart(index)} className="self-start">
        <Icon
          path={mdiClose}
          size={1}
          className="text-fg.muted hover:text-fg.default transition-all"
        />
      </button>
    </div>
  );
}
