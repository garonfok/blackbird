import { Button } from "@/components/ui/button";
import { DropdownMenuSubContent } from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { mdiTune } from "@mdi/js";
import Icon from "@mdi/react";
import { Arrangers } from "./Filters/Arrangers";
import { Composers } from "./Filters/Composers";
import { Difficulty } from "./Filters/Difficulty";
import { Instruments } from "./Filters/Instruments";
import { Lyricists } from "./Filters/Lyricists";
import { Orchestrators } from "./Filters/Orchestrators";
import { Tags } from "./Filters/Tags";
import { Transcribers } from "./Filters/Transcribers";
import { Year } from "./Filters/Year";

export function FilterMenu() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary" className="flex gap-[4px]">
          <Icon path={mdiTune} size={2 / 3} className="shrink-0" />
          <span>Filters</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full max-w-lg p-0" align="start" asChild>
        <div className="flex flex-col bg-float-bg.default">
          <div className="flex flex-col p-[4px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Tags
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Tags />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Year Published
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px] w-fit">
                <Year />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Difficulty
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px] w-fit">
                <Difficulty />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Instruments
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Instruments />
              </PopoverContent>
            </Popover>
          </div>
          <Separator />
          <div className="flex flex-col p-[4px]">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Composers
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Composers />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Arrangers
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Arrangers />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Orchestrators
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Orchestrators />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Transcribers
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Transcribers />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="main" className="w-full justify-start">
                  Lyricists
                </Button>
              </PopoverTrigger>
              <PopoverContent side="right" className="p-[4px]">
                <Lyricists />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

<DropdownMenuSubContent></DropdownMenuSubContent>;
