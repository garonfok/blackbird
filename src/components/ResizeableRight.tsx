import classNames from "classnames";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

interface ResizableRightProps extends PropsWithChildren {
  width: number;
  minWidth: number;
  maxWidth: number;
}

export function ResizableRight(props: ResizableRightProps) {
  const { width, minWidth, maxWidth, children } = props;
  const [isResizing, setIsResizing] = useState(false);
  const [panelWidth, setPanelWidth] = useState(width);

  const sidebarRef = useRef<HTMLDivElement>(null);

  const resize = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      if (isResizing && sidebarRef.current) {
        setPanelWidth(
          sidebarRef.current.getBoundingClientRect().right - e.clientX
        );
      }
    },
    [isResizing]
  );

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", () => setIsResizing(false));
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", () => {});
    };
  }, [resize]);

  return (
    <div ref={sidebarRef} className="flex flex-row-reverse shadow-panel">
      <div
        className="bg-bg.default p-[14px]"
        style={{ width: panelWidth, minWidth, maxWidth }}
      >
        {children}
      </div>
      <div
        className={classNames(
          "w-[2px] hover:cursor-col-resize resize-x hover:bg-fg.default",
          isResizing ? "bg-fg.default" : "bg-fg.subtle"
        )}
        onMouseDown={() => setIsResizing(true)}
      />
    </div>
  );
}
