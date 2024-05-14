
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { LeftPanel } from "./LeftPanel";
import { Tabs } from "@radix-ui/react-tabs";
import * as Categories from "./Categories";

export function Settings() {
  return (
    <Tabs className="flex h-full" defaultValue="general">
      <ResizablePanelGroup direction="horizontal">
        <LeftPanel />
        <ResizablePanel className="bg-main-bg.default">
          <div className="relative">
            {Object.entries(Categories).map(([key, Component]) => (
              <Component key={key} />
            ))}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Tabs>
  );
}
