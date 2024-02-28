import { mdiClose, mdiDragVertical } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";
import { useAppDispatch } from "@/app/hooks";
import { EditScore } from "@/app/types";
import { Renameable } from "@/components/Renameable";
import { removeScore, updateScoreName } from "../../../../pieceSlice";

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
        "flex items-center justify-between px-[14px] py-[8px] rounded-default border border-fg.2 bg-bg.1 hover:ring-1 ring-fg.0",
        selected && "border-fg.0"
      )}
    >
      <div className="w-full flex items-start gap-[2px]">
        <Icon
          path={mdiDragVertical}
          size={1}
          className="ml-[-10px] text-fg.1 shrink-0"
        />
          <Renameable
            index={index}
            isPart={false}
            isRenaming={score.renaming}
            name={score.name}
            setName={handleSetName}
          />
      </div>
      <button
        onClick={() => handleClickRemoveScore(index)}
        className="self-start"
      >
        <Icon
          path={mdiClose}
          size={1}
          className="link"
        />
      </button>
    </div>
  );
}
