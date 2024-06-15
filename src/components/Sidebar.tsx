import { cn } from "@/app/utils";
import { MouseEvent, ReactNode, useState } from "react";

export function Sidebar({
  direction = "left",
  defaultWidth = 300,
  minWidth = 200,
  maxWidth = 450,
  ...props
}: {
  children: ReactNode;
  direction: "left" | "right";
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}) {
  const { children } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [width, setWidth] = useState(defaultWidth);

  let currentCursorStyle: string | null = null;
  let styleElement: HTMLStyleElement | null = null;

  function handlePointerDownDrag(event: MouseEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();

    setIsDragging(true);

    const startX = event.clientX;
    const startWidth = width;

    const handlePointerMove = (event: globalThis.PointerEvent) => {
      const delta =
        direction === "left" ? event.clientX - startX : startX - event.clientX;
      setWidth(Math.min(Math.max(minWidth, startWidth + delta), maxWidth));

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

      setIsDragging(false);

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
    <div
      className={cn(
        "flex relative group/sidebar",
        direction === "left" ? "flex-row" : "flex-row-reverse",
      )}
    >
      <div
        className="h-full"
        style={{
          width: `${width / 16}rem`,
        }}
      >
        {children}
      </div>
      <div
        onPointerDown={handlePointerDownDrag}
        className={cn(
          "absolute top-0 cursor-ew-resize w-1 border-divider.default group-hover/sidebar:border-divider.focus hover:bg-divider.focus transition-all h-full",
          isDragging && "bg-divider.focus",
          direction === "left" ? "right-0 border-r" : "left-0 border-l",
        )}
      />
    </div>
  );
}
