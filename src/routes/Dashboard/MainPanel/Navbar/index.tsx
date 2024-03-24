import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { debounce, isWindows } from "@/app/utils";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useHotkey } from "@/hooks/useHotkey";
import { mdiMagnify, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import classNames from "classnames";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { setQuery } from "../querySlice";
import { AdvancedFilters } from "./AdvancedFilters";

export function Navbar() {
  const [isSearchFocused, setSearchFocused] = useState(false);
  const [isMacOS, setIsMacOS] = useState(false);
  const [isFiltersOpen, setFiltersOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const setlist = useAppSelector((state) => state.setlist);

  useHotkey("k", () => {
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

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  return (
    <div className="p-[14px]">
      <div className="flex flex-wrap gap-[14px] items-center">
        <Popover open={isFiltersOpen} onOpenChange={setFiltersOpen}>
          <PopoverAnchor asChild>
            <div className="w-full max-w-[512px] flex flex-col">
              <span
                className={classNames(
                  "bg-bg.2 gap-[14px] py-[8px] px-[14px] rounded-default flex text-fg.2 items-center transition-default",
                  isSearchFocused && "ring-1 ring-fg.0"
                )}
              >
                <Icon
                  path={mdiMagnify}
                  size={1}
                  className={classNames(
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
                <PopoverTrigger>
                  <Icon
                    path={mdiTune}
                    size={1}
                    className="shrink-0 link"
                  />
                </PopoverTrigger>
              </span>
            </div>
          </PopoverAnchor>
          {setlist.setlist && (
            <span className="text-heading-default">{setlist.setlist.name}</span>
          )}
          <PopoverContent className="w-full max-w-lg">
            <AdvancedFilters onOpenChange={setFiltersOpen} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
