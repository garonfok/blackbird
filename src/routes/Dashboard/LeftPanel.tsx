import { ResizableLeft } from "../../components/ResizeableLeft";

import Icon from "@mdi/react";
import {
  mdiBookshelf,
  mdiTag,
  mdiChevronDown,
  mdiCog,
  mdiPlus,
  mdiBookOpenOutline,
} from "@mdi/js";
import classNames from "classnames";
import { useState } from "react";

export function LeftPanel() {
  const [isTagsOpen, setTagsOpen] = useState(false);

  const tagCount = 25;
  const setlistCount = 15;

  return (
    <ResizableLeft width={256} minWidth={160} maxWidth={256}>
      <div className="flex flex-col h-full gap-[14px]">
        <button className="w-full bg-brand.default py-[8px] rounded-[4px]">
          New piece
        </button>
        <hr className="text-fg.subtle" />
        <ol className="flex flex-col gap-[14px] overflow-y-auto max-h-[50%] scrollbar-default">
          <li>
            <button className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default">
              <Icon path={mdiBookshelf} size={1} />
              <span>All pieces</span>
            </button>
          </li>
          {Array.from({ length: setlistCount }).map((_, i) => (
            <li key={i}>
              <button className="text-fg.muted flex items-center gap-[14px] w-full hover:text-fg.default">
                <Icon
                  path={mdiBookOpenOutline}
                  size={1}
                  className="flex-shrink-0"
                />
                <span className="truncate">
                  {Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15)}
                </span>
              </button>
            </li>
          ))}
        </ol>
        {/* <hr className="text-fg.subtle" /> */}
        <div className="flex flex-col gap-[14px] h-0 flex-grow">
          <span className="flex gap-[14px]">
            <button
              className="flex gap-[14px] items-center w-full"
              onClick={() => setTagsOpen(!isTagsOpen)}
            >
              <Icon
                path={mdiChevronDown}
                size={1}
                className={classNames(
                  "transition-all",
                  isTagsOpen && "transform rotate-180"
                )}
              />
              <span>Tags</span>
            </button>
            <button>
              <Icon
                path={mdiPlus}
                size={1}
                className="text-fg.muted hover:text-fg.default"
              />
            </button>
          </span>
          {isTagsOpen && (
            <ul className="ml-[14px] overflow-y-auto flex flex-col gap-[8px] scrollbar-default">
              {Array.from({ length: tagCount }).map((_, i) => (
                <li key={i}>
                  <button className="flex items-center gap-[14px] w-full text-fg.muted hover:text-fg.default">
                    <Icon
                      path={mdiTag}
                      className="flex-shrink-0"
                      size={1}
                      style={{
                        color: `#${Math.floor(
                          Math.random() * 16777215
                        ).toString(16)}`,
                      }}
                    />
                    <span className="truncate">
                      {/* Generate a random string */}
                      {Math.random().toString(36).substring(2, 15) +
                        Math.random().toString(36).substring(2, 15)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <hr className="text-fg.subtle" />
        <button className="flex gap-[14px] items-center text-fg.muted hover:text-fg.default">
          <Icon path={mdiCog} size={1} />
          <span>Settings</span>
        </button>
      </div>
    </ResizableLeft>
  );
}
