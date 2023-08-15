import { useMachine } from "@xstate/react";
import { Navbar } from "./Navbar";
import { Wizard } from "./Wizard";
import { stepsMachine } from "./stepMachine";

export function MainPanel() {
  const [stepState, sendStep] = useMachine(stepsMachine);

  return (
    <div className="w-full flex flex-col overflow-hidden">
      <Wizard stepState={stepState} />
      <Navbar stepState={stepState} sendStep={sendStep} />
    </div>
  );
}
