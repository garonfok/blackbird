import { Popover } from "@headlessui/react";
import { mdiMagnify, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import classNames from "classnames";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { debounce, isWindows } from "src/app/utils";
import { setQuery } from "../querySlice";
import { AdvancedFilters } from "./AdvancedFilters";

export function Navbar() {
  const [isSearchFocused, setSearchFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const setlist = useAppSelector((state) => state.setlist);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleKeyDown(event: KeyboardEvent) {
    if (
      event.key === "k" &&
      ((await isWindows()) ? event.ctrlKey : event.metaKey)
    ) {
      event.preventDefault();
      inputRef.current?.focus();
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch(setQuery({ query: event.target.value }));
  }

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  return (
    <div className="p-[14px]">
      <div className="flex flex-wrap gap-[14px] items-center">
        <Popover className="w-full max-w-[512px] flex flex-col">
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
              placeholder="Type Ctrl + K to search"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={handleChangeDebounced}
            />
            <Popover.Button>
              <Icon
                path={mdiTune}
                size={1}
                className="shrink-0 link"
              />
            </Popover.Button>
          </span>
          <div className="relative">
            <Popover.Panel className="absolute z-10 w-full top-[14px]">
              {({ close }) => <AdvancedFilters onClose={close} />}
            </Popover.Panel>
          </div>
        </Popover>
        {setlist.setlist && (
          <span className="text-heading-default">{setlist.setlist.name}</span>
        )}
      </div>
    </div>
  );
}
