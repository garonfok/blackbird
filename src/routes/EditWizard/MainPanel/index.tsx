import { useMachine } from "@xstate/react";
import { ScaleLoader } from "react-spinners";
import { useAppSelector } from "src/app/hooks";
import { Navbar } from "./Navbar";
import { Wizard } from "./Wizard";
import { stepsMachine } from "./stepMachine";

export function MainPanel() {
  const [stepState, sendStep] = useMachine(stepsMachine);
  const loading = useAppSelector((state) => state.loading);
  const piece = useAppSelector((state) => state.piece.present);

  return (
    <div className="w-full flex flex-col overflow-hidden">
      {loading ? (
        <div className="h-full w-full flex justify-center items-center flex-col">
          {/* TODO: Replace this with shadcn/ui component */}
          <ScaleLoader color="#FFBB33" />
          <span className="text-heading-default">
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
