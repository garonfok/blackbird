import classNames from "classnames";
import { EditScore } from "../../../../../../app/types";
import { useAppDispatch } from "../../../../../../app/hooks";
import { removeScore, updateScoreName } from "../../../../pieceSlice";
import Icon from "@mdi/react";
import { mdiClose, mdiDragVertical } from "@mdi/js";
import { Renameable } from "../../../../../../components/Renameable";

export function Card(props: {
  index: number;
  score: EditScore;
  selected: boolean;
}) {
  const { index, score, selected } = props;

  const dispatch = useAppDispatch();

  function handleClickRemoveScore(index: number) {
    dispatch(removeScore(index));
  }

  function handleSetName(name: string, index: number) {
    dispatch(updateScoreName({ index, name }));
  }

  return (
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
          className="ml-[-10px] text-fg.muted"
        />
        <div className="flex flex-col w-full">
          <Renameable
            index={index}
            isPart={false}
            isRenaming={score.renaming}
            name={score.name}
            setName={handleSetName}
          />
        </div>
      </div>
      <button
        onClick={() => handleClickRemoveScore(index)}
        className="self-start"
      >
        <Icon
          path={mdiClose}
          size={1}
          className="text-fg.muted hover:text-fg.default transition-all"
        />
      </button>
    </div>
  );
}
