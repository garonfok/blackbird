import { useEffect, useState } from "react";
import { StepState } from "../stepMachine";
import { GeneralInformation } from "./GeneralInformation";
import { Musicians } from "./Musicians";
import { Parts } from "./Parts";
import { Files } from "./Files";
import { Scores } from "./Scores";

export function Wizard(props: { stepState: StepState }) {
  const { stepState } = props;
  const [title, setTitle] = useState<string>();
  const [content, setContent] = useState<JSX.Element>();

  useEffect(() => {
    switch (stepState.value) {
      case "generalInfo":
        setTitle("General Information");
        setContent(<GeneralInformation />);
        break;
      case "musicians":
        setTitle("Musicians");
        setContent(<Musicians />);
        break;
      case "parts":
        setTitle("Parts");
        setContent(<Parts />);
        break;
      case "scores":
        setTitle("Scores");
        setContent(<Scores />);
        break;
      case "files":
        setTitle("Files");
        setContent(<Files />);
        break;
      default:
        setTitle("Error");
        setContent(<div>Something went wrong</div>);
        break;
    }
  }, [stepState]);

  return (
    <div className="p-[14px] flex flex-col gap-[14px] flex-grow overflow-hidden">
      <span className="text-[20px]">{title}</span>
      <div className="bg-bg.default w-full rounded-[4px] p-[14px] flex-grow overflow-hidden">
        {content}
      </div>
    </div>
  );
}
