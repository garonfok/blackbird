import { useMachine } from "@xstate/react";
import { Navbar } from "./Navbar";
import { Wizard } from "./Wizard";
import { stepsMachine } from "./stepMachine";
import { useAppSelector } from "../../../app/hooks";
import { ScaleLoader } from "react-spinners";

export function MainPanel() {
  const [stepState, sendStep] = useMachine(stepsMachine);
  const loading = useAppSelector((state) => state.loading);
  const piece = useAppSelector((state) => state.piece);

  return (
    <div className="w-full flex flex-col overflow-hidden">
      {loading ? (
        <div className="h-full w-full flex justify-center items-center flex-col">
          <ScaleLoader color="#fff" />
          <span className="text-[20px] font-bold">
            {piece.id ? "Saving piece..." : "Creating piece..."}
          </span>
        </div>
      ) : (
        <>
          <Wizard stepState={stepState} />
          <Navbar stepState={stepState} sendStep={sendStep} />
        </>
      )}
    </div>
  );
}
