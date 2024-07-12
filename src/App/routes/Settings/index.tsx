import { Tabs } from "@radix-ui/react-tabs";
import * as Categories from "./Categories";
import { LeftPanel } from "./LeftPanel";
import { Sidebar } from "@/components/Sidebar";

export function Settings() {
  return (
    <Tabs className="flex h-full" defaultValue="general">
      <Sidebar direction="left">
        <LeftPanel />
      </Sidebar>
      <div className="relative bg-main-bg.default grow">
        {Object.entries(Categories).map(([key, Component]) => (
          <Component key={key} />
        ))}
      </div>
    </Tabs>
  );
}
