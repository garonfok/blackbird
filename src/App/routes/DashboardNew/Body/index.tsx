import { MouseEvent, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Main } from "./Main";

const SIDEBAR_WIDTH = {
  DEFAULT: 300,
  MIN: 100,
  MAX: 450,
};

export function Body() {
  let currentCursorStyle: string | null = null;
  let styleElement: HTMLStyleElement | null = null;

  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_WIDTH.DEFAULT);

  function handlePointerDownDrag(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = sidebarWidth;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const delta = event.clientX - startX;
      setSidebarWidth(
        Math.min(
          Math.max(SIDEBAR_WIDTH.MIN, startWidth + delta),
          SIDEBAR_WIDTH.MAX,
        ),
      );

      if (currentCursorStyle === "ew-resize") {
        return;
      }

      if (styleElement === null) {
        styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
      }

      styleElement.innerHTML = `*{cursor: ew-resize !important;}`;
    };

    const handlePointerUp = () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);

      if (styleElement !== null) {
        document.head.removeChild(styleElement);
        styleElement = null;
        currentCursorStyle = null;
      }
    };

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
  }

  return (
    <div className="grow flex">
      <Sidebar width={sidebarWidth} />
      <div
        className="basis-[4px] cursor-ew-resize"
        onPointerDown={handlePointerDownDrag}
      />
      <Main />
    </div>
  );
}
