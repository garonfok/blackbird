import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { ResizableRight } from "../../components/ResizeableRight";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(384);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1024) {
        setMaxWidth(256);
      } else {
        setMaxWidth(384);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <ResizableRight width={256} minWidth={192} maxWidth={maxWidth}>
      <div className="flex flex-col h-full gap-[14px]">
        <span className="flex justify-between items-center py-[8px]">
          <span className="text-fg.muted">Viewing</span>
          <button className="text-fg.muted hover:text-fg.default transition-all">
            <Icon path={mdiClose} size={1} />
          </button>
        </span>
        <hr className="text-fg.subtle" />
        <div className="flex flex-col gap-[14px] flex-grow"></div>
        <hr className="text-fg.subtle" />
        <div className="flex flex-col gap-[8px]">
          <button className="text-left text-fg.muted hover:text-fg.default transition-all">
            Open folder
          </button>
          <button className="text-left text-fg.muted hover:text-fg.default transition-all">
            Edit data
          </button>
          <button className="text-left text-fg.muted hover:text-fg.default transition-all">
            Print parts
          </button>
          <button className="text-left text-danger.default hover:text-danger.emphasis transition-all">
            Delete
          </button>
        </div>
      </div>
    </ResizableRight>
  );
}
