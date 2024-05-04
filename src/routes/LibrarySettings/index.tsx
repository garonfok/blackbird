import { Button } from "@/components/ui/button";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { useNavigate } from "react-router-dom";
import * as SettingEntries from "./SettingEntries";
import { useHotkey } from "@/app/hooks";

export function LibSettings() {
  const navigate = useNavigate();
  useHotkey("Escape", () => navigate("/"));

  return (
    <div className="justify-center flex h-screen bg-gradient-to-r from-sidebar-bg.default from-[24%] to-[25%] to-main-bg.default">
      <TabsPrimitive.Tabs defaultValue="musicians" className="w-[800px] flex gap-[14px] h-full">
        <TabsPrimitive.List className="w-[200px] bg-sidebar-bg.default h-full p-[14px] flex flex-col gap-[14px]">
          <h1 className="text-heading-default">Library Settings</h1>
          <div className="flex flex-col gap-[8px]">
            <TabsPrimitive.Trigger value="musicians" asChild>
              <Button variant="link" className="w-full justify-start">
                Musicians
              </Button>
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="instruments" asChild>
              <Button variant="link" className="w-full justify-start">
                Instruments
              </Button>
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="tags" asChild>
              <Button variant="link" className="w-full justify-start">
                Tags
              </Button>
            </TabsPrimitive.Trigger>
          </div>
        </TabsPrimitive.List>
        <div className="bg-main-bg.default h-full p-[14px] flex flex-col gap-[14px] w-full">
          <div className="relative">
            {Object.entries(SettingEntries).map(([key, Component]) => (
              <Component key={key} />
            ))}
          </div>
        </div>
      </TabsPrimitive.Tabs>
    </div >
  );
}

