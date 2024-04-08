import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectMusicians } from "./components/SelectMusicians";

export function Musicians() {
  return (
    <ScrollArea>
      <div className='p-[14px] flex flex-col gap-[14px]'>
        <SelectMusicians role="arranger" />
        <SelectMusicians role="transcriber" />
        <SelectMusicians role="orchestrator" />
        <SelectMusicians role="lyricist" />
      </div>
    </ScrollArea>
  );
}
