import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { pushScore } from "../../../pieceSlice";
import { ScoresList } from "./ScoresList";

export function Scores() {
  const piece = useAppSelector((state) => state.piece);
  const dispatch = useAppDispatch();

  function handleClickAddScore() {
    dispatch(
      pushScore({
        name: "Full score",
        renaming: false,
        id: Math.max(...piece.scores.map((score) => score.id), 0) + 1,
        file: null,
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
    </div>
  );
}
