import { ScrollArea } from "@/components/ui/scroll-area";
import { Setlists } from "./Setlists";
import { Tags } from "./Tags";

export function Sidebar(props: { width: number }) {
  const { width } = props;

  return (
    <div
      className="bg-bg.0 border border-divider.default flex flex-col gap-[4px] p-[2px] rounded-default"
      style={{
        width,
      }}
    >
      <ScrollArea className="h-full">
        <div className="relative w-full">
          <div className="absolute h-0 grow w-full">
            <Setlists />
            <Tags />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
