import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Setlist } from "@/app/types";
import { debounce, isWindows } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCmdOrCtrlHotkey } from "@/hooks/useHotkey";
import { cn } from "@/app/utils";
import { mdiBookOpenVariantOutline, mdiBookshelf, mdiMagnify, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { clearSetlist, setSetlist } from "../../reducers/setlistSlice";
import { setQuery } from "../querySlice";
import { AdvancedFilters } from "./AdvancedFilters";

export function Navbar() {
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const setlist = useAppSelector((state) => state.setlist);
  const setlists = useAppSelector((state) => state.setlists);

  useCmdOrCtrlHotkey("k", () => {
    inputRef.current?.focus();
  })

  useEffect(() => {
    setOS();
  }, []);

  async function setOS() {
    setIsMacOS(!(await isWindows()));
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch(setQuery({ query: event.target.value }));
  }

  function handleSelectSetlist(setlist: Setlist) {
    dispatch(setSetlist({ setlist }));
  }

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  return (
    <div className="flex flex-col">
      <div className="px-[14px] py-[14px] w-full flex gap-[8px] items-center">
        <Popover open={isFiltersOpen} onOpenChange={setFiltersOpen}>
          <PopoverTrigger asChild>
            <Button variant="main" className="p-1">
              <Icon
                path={mdiTune}
                size={1}
                className="shrink-0"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full max-w-lg p-0" align="start">
            <AdvancedFilters onOpenChange={setFiltersOpen} />
          </PopoverContent>
        </Popover>
        <span
          className={cn(
            "bg-bg.2 gap-[14px] py-1 px-2 rounded-default flex w-full text-fg.2 items-center transition-default",
            isSearchFocused && "ring-1 ring-fg.0"
          )}
        >
          <Icon
            path={mdiMagnify}
            size={1}
            className={cn(
              "shrink-0 transition-default",
              isSearchFocused && "text-fg.0"
            )}
          />
          <input
            ref={inputRef}
            className="bg-transparent outline-none w-full placeholder-fg.2 text-fg.0"
            type="text"
            placeholder={`Type ${isMacOS ? "Cmd" : "Ctrl"} + K to search`}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={handleChangeDebounced}
          />
        </span>
      </div>
      <div className="px-[14px]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="text-left text-lg font-bold leading-8 hover:bg-main-bg.hover px-2 py-1 rounded-default">
              {setlist.setlist ? (
                <span className="flex gap-[8px] items-center">
                  <Icon path={mdiBookOpenVariantOutline} size={1.25} />
                  <span>{setlist.setlist.name}</span>
                </span>
              ) :
                <span className="flex gap-[8px] items-center">
                  <Icon path={mdiBookshelf} size={1.25} />
                  <span>All Pieces</span>
                </span>
              }
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="gap-[8px]" onSelect={() => dispatch(clearSetlist())}>
              <Icon path={mdiBookshelf} size={1} className="shrink-0" />
              <span>All Pieces</span>
            </DropdownMenuItem>
            {setlists.map((setlist) => (
              <DropdownMenuItem key={setlist.id} className="gap-[8px]" onSelect={() => handleSelectSetlist(setlist)}>
                <Icon path={mdiBookOpenVariantOutline} size={1} className="shrink-0" />
                <span>{setlist.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
