import classNames from "classnames";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { clearFiles } from "../filesSlice";
import { clearPiece } from "../pieceSlice";
import { createPiece } from "./createPiece";
import { StepEvent, StepState } from "./stepMachine";

export function Navbar(props: { stepState: StepState; sendStep: StepEvent }) {
  const { stepState, sendStep } = props;

  const dispatch = useAppDispatch();
  const piece = useAppSelector((state) => state.piece);
  const navigate = useNavigate();

  async function handleClickFinish() {
    await createPiece(piece);
    sendStep("FINISH");
    dispatch(clearFiles());
    dispatch(clearPiece());
    navigate("/");
  }

  const handleClickPrevious = useCallback(() => {
    sendStep("PREVIOUS");
  }, []);

  const handleClickNext = useCallback(() => {
    sendStep("NEXT");
  }, []);

  return (
    <div className="bg-bg.default p-[14px] shadow-panel grid grid-cols-3">
      {stepState.nextEvents.includes("PREVIOUS") ? (
        <button onClick={handleClickPrevious} className="text-left">
          Previous
        </button>
      ) : (
        <div />
      )}
      <span className="text-fg.muted text-center"></span>
      {stepState.nextEvents.includes("NEXT") && (
        <button
          onClick={handleClickNext}
          className={classNames(
            "text-right",
            (piece.title.length === 0 || piece.composers.length === 0) &&
              "text-fg.subtle"
          )}
          disabled={piece.title.length === 0 || piece.composers.length === 0}
        >
          Next
        </button>
      )}
      {stepState.nextEvents.includes("FINISH") && (
        <button onClick={handleClickFinish} className="text-right">
          Create piece
        </button>
      )}
    </div>
  );
}
