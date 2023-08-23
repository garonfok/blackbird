import { mdiMagnify, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import classNames from "classnames";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { debounce, isWindows } from "../../../app/utils";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { setQuery } from "./querySlice";

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
    <div className="bg-bg.default p-[14px] shadow-panel">
      <div className="flex flex-wrap gap-[14px] items-center">
        <span
          className={classNames(
            "bg-bg.inset gap-[14px] py-[8px] px-[14px] rounded-[4px] flex w-full max-w-[512px] text-fg.subtle items-center transition-all",
            isSearchFocused && "ring-1 ring-fg.default"
          )}
        >
          <Icon
            path={mdiMagnify}
            size={1}
            className={classNames(
              "shrink-0 transition-all",
              isSearchFocused && "text-fg.default"
            )}
          />
          <input
            ref={inputRef}
            className="bg-transparent outline-none w-full placeholder-fg.subtle text-fg.default"
            type="text"
            placeholder="Type Ctrl + K to search"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={handleChangeDebounced}
          />
          <button>
            <Icon
              path={mdiTune}
              size={1}
              className="text-fg.muted hover:text-fg.default"
            />
          </button>
        </span>
        <span className="text-[20px] font-bold">
          {setlist.setlist && setlist.setlist.name}
        </span>
      </div>
    </div>
  );
}
