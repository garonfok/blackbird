import classNames from "classnames";
import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearFiles } from "../filesSlice";
import { setLoading } from "../loadingSlice";
import { clearPiece } from "../pieceSlice";
import { createPiece } from "./createPiece";
import { StepEvent, StepState } from "./stepMachine";
import { updatePiece } from "./updatePiece";

export function Navbar(props: { stepState: StepState; sendStep: StepEvent }) {
  const { stepState, sendStep } = props;

  const dispatch = useAppDispatch();
  const piece = useAppSelector((state) => state.piece.present);
  const navigate = useNavigate();
  const { state } = useLocation();

  async function handleClickFinish() {
    dispatch(setLoading(true));
    if (piece.id) {
      await updatePiece(piece, state?.piece?.path);
    } else {
      await createPiece(piece);
    }
    sendStep("FINISH");
    dispatch(clearFiles());
    dispatch(clearPiece());
    dispatch(setLoading(false));
    navigate("/");
  }

  const handleClickPrevious = useCallback(() => {
    sendStep("PREVIOUS");
  }, []);

  const handleClickNext = useCallback(() => {
    sendStep("NEXT");
  }, []);

  return (
    <div className="p-[14px] flex justify-between">
      {stepState.nextEvents.includes("PREVIOUS") ? (
        <button onClick={handleClickPrevious} className="text-left link">
          Previous
        </button>
      ) : (
        <div />
      )}
      {stepState.nextEvents.includes("NEXT") && (
        <button
          onClick={handleClickNext}
          className={classNames(
            "text-right",
            piece.title.length === 0 || piece.composers.length === 0
              ? "text-fg.2"
              : "link"
          )}
          disabled={piece.title.length === 0 || piece.composers.length === 0}
        >
          Next
        </button>
      )}
      {stepState.nextEvents.includes("FINISH") && (
        <button onClick={handleClickFinish} className="text-right">
          {piece.id ? "Save changes" : "Create piece"}
        </button>
      )}
    </div>
  );
}
