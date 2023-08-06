import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";

export function EditWizard() {
  return (
    <div className="flex h-full w-full">
      <LeftPanel />
      <MainPanel />
      <RightPanel />
    </div>
  );
}
