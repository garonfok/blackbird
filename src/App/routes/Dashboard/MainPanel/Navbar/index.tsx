import { useCmdOrCtrlHotkey } from "@/hooks/hotkey";
import { useAppDispatch } from "@/hooks/store";
import { cn, debounce } from "@/utils/lib";
import { mdiMagnify } from "@mdi/js";
import { Icon } from "@mdi/react";
import { ChangeEvent, useCallback, useRef, useState } from "react";
import { setQuery } from "../querySlice";

export function Navbar() {
  const [isSearchFocused, setSearchFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();

  useCmdOrCtrlHotkey("k", () => {
    inputRef.current?.focus();
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    dispatch(setQuery({ query: event.target.value }));
  }

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  return (
    <div className="px-[14px] pt-[8px] w-full flex gap-[8px] items-center">
      <span className="bg-bg.2 gap-[4px] py-[2px] px-[4px] border border-divider.default rounded-default flex w-full text-fg.2 items-center transition-default">
        <Icon
          path={mdiMagnify}
          size={1}
          className={cn(
            "shrink-0 transition-default",
            isSearchFocused && "text-fg.0",
          )}
        />
        <input
          ref={inputRef}
          className="bg-transparent outline-none w-full placeholder-fg.2 text-fg.0"
          placeholder={`Type ${window.navigator.userAgent.includes("Windows") ? "Ctrl" : "⌘"} K to search`}
          type="text"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          onChange={handleChangeDebounced}
        />
      </span>
    </div>
  );
}
