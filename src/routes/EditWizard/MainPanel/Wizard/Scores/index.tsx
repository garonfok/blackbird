import { mdiChevronDown, mdiPlus } from "@mdi/js";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import Icon from "@mdi/react";
import { useState } from "react";
import classNames from "classnames";
import { ScoresList } from "./ScoresList";
import { pushScore } from "../../../pieceSlice";

export function Scores() {
  const [showingParts, setShowingParts] = useState(false);

  const piece = useAppSelector((state) => state.piece);
  const dispatch = useAppDispatch();

  function handleClickAddScore() {
    dispatch(
      pushScore({
        name: "Full score",
        renaming: false,
        id: Math.max(...piece.scores.map((score) => score.id ?? 0)) + 1,
      })
    );
  }

  return (
    <div className="edit-wizard-panel">
      <ScoresList />
      <button
        onClick={handleClickAddScore}
        className="text-left text-fg.muted hover:text-fg.default transition-all flex gap-[4px] items-center w-fit"
      >
        <Icon path={mdiPlus} size={1} />
        Add score
      </button>

      {/* <hr className="text-fg.subtle" />
      <button
        onClick={() => setShowingParts(!showingParts)}
        className="flex justify-between text-fg.muted hover:text-fg.default transition-all"
      >
        <span>Show parts</span>
        <Icon
          path={mdiChevronDown}
          size={1}
          className={classNames("transition-all", showingParts && "rotate-180")}
        />
      </button>
      {showingParts && (
        <div className="flex flex-col bg-bg.inset p-[4px] gap-[4px] rounded-[4px]">
          {piece.parts.map((part) => (
            <div key={part.id} className="">
              <span className="text-fg.muted">{part.name}</span>
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
}
