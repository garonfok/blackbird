import { MouseEvent, useState } from "react";
import { Details } from "./Details";
import { FilterBar } from "./FilterBar";
import { Navbar } from "./Navbar";
import { Table } from "./Table";

const DETAILS_HEIGHT = {
  DEFAULT: 300,
  DETAILS_MIN: 50,
  TABLE_MIN: 50,
};

export function Main() {
  let currentCursorStyle: string | null = null;
  let styleElement: HTMLStyleElement | null = null;

  const [detailsHeight, setDetailsHeight] = useState(DETAILS_HEIGHT.DEFAULT);

  function handlePointerDownDrag(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();

    const startY = event.clientY;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const delta = event.clientY - startY;

      setDetailsHeight(
        Math.max(DETAILS_HEIGHT.DETAILS_MIN, detailsHeight - delta),
      );

      if (currentCursorStyle === "ns-resize") {
        return;
      }

      if (styleElement === null) {
        styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
      }

      styleElement.innerHTML = `*{cursor: ns-resize !important;}`;
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
    <div className="grow flex flex-col">
      <div className="border border-divider.default rounded-default flex flex-col grow">
        <Navbar />
        <FilterBar />
        <Table minHeight={DETAILS_HEIGHT.TABLE_MIN} />
      </div>
      <div
        className="basis-[4px] cursor-ns-resize"
        onPointerDown={handlePointerDownDrag}
      />
      <Details height={detailsHeight} />
    </div>
  );
}
