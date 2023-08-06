import { mdiMagnify, mdiTune } from "@mdi/js";
import { Icon } from "@mdi/react";
import classNames from "classnames";
import { useState } from "react";

export function Navbar() {
  const [isSearchFocused, setSearchFocused] = useState(false);
  return (
    <div className="bg-bg.default p-[14px] shadow-panel">
      <div className="flex">
        <span className="bg-bg.inset gap-[14px] py-[8px] px-[14px] rounded-[4px] flex w-full max-w-[512px] text-fg.subtle items-center">
          <Icon
            path={mdiMagnify}
            size={1}
            className={classNames(
              "shrink-0",
              isSearchFocused && "text-fg.default"
            )}
          />
          <input
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
