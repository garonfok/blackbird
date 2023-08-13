import { mdiMagnify, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import classNames from "classnames";
import { useEffect, useRef, useState } from "react";
import { isWindows } from "../../../app/utils";

export function Navbar() {
  const [isSearchFocused, setSearchFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  async function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "k" && ((await isWindows()) ? e.ctrlKey : e.metaKey)) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  }

  return (
    <div className="bg-bg.default p-[14px] shadow-panel">
      <div className="flex">
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
          />
          <button>
            <Icon
              path={mdiTune}
              size={1}
              className="text-fg.muted hover:text-fg.default"
            />
          </button>
        </span>
      </div>
    </div>
  );
}
