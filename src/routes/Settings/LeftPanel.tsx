
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { mdiHomeOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { List, Trigger } from "@radix-ui/react-tabs";
import { Link } from "react-router-dom";
export function LeftPanel() {
  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-sidebar-bg.default p-[14px] flex flex-col gap-[14px]">
        <Button variant="link" asChild>
          <Link to="/" className="flex items-center gap-[8px] w-fit">
            <Icon path={mdiHomeOutline} size={1} />
            <span>Home</span>
          </Link>
        </Button>
        <List className="flex flex-col gap-[14px]">
          <div>
            <h2 className="text-fg.2">Application</h2>
            <Trigger value="general" asChild>
              <Button variant="link" className="w-full justify-start">
                General
              </Button>
            </Trigger>
          </div>
          <div>
            <h2 className="text-fg.2">Library</h2>
            <Trigger value="musicians" asChild>
              <Button variant="link" className="w-full justify-start">
                Musicians
              </Button>
            </Trigger>
            <Trigger value="tags" asChild>
              <Button variant="link" className="w-full justify-start">
                Tags
              </Button>
            </Trigger>
          </div>
        </List>
      </ResizablePanel>
      <ResizableHandle />
    </>
  )
}
