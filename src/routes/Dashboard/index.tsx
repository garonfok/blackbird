import { LeftPanel } from "./LeftPanel";
import { MainPanel } from "./MainPanel";
import { RightPanel } from "./RightPanel";

export function Dashboard() {
  return (
    <div className="flex h-full w-full">
      <LeftPanel />
      <MainPanel />
      <RightPanel />
    </div>
  );
}
