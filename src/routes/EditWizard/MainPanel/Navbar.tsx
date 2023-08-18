import { useCallback } from "react";
import { StepEvent, StepState } from "./stepMachine";

export function Navbar(props: { stepState: StepState; sendStep: StepEvent }) {
  const { stepState, sendStep } = props;

  const handleClickPrevious = useCallback(() => {
    sendStep("PREVIOUS");
  }, []);

  const handleClickNext = useCallback(() => {
    sendStep("NEXT");
  }, []);

  const handleClickFinish = useCallback(() => {
    sendStep("FINISH");
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
        <button onClick={handleClickNext} className="text-right">
          Next
        </button>
      )}
      {stepState.nextEvents.includes("FINISH") && (
        <button onClick={handleClickFinish} className="text-right">
          Finish
        </button>
      )}
    </div>
  );
}
