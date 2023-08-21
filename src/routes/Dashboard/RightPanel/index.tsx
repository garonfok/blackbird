import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { ResizableRight } from "../../../components/ResizeableRight";
import { clearPiece } from "../previewSlice";
import { Preview } from "./Preview";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(384);

  const preview = useAppSelector((state) => state.preview);
  const dispatch = useAppDispatch();

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

  function handleClickClearPreview() {
    dispatch(clearPiece());
  }

  return (
    <ResizableRight width={256} minWidth={192} maxWidth={maxWidth}>
      <div className="flex flex-col h-full gap-[14px]">
        <span className="flex justify-between items-center py-[8px]">
          <span className="text-fg.muted">Viewing</span>
          <button
            onClick={handleClickClearPreview}
            className="text-fg.muted hover:text-fg.default transition-all"
          >
            <Icon path={mdiClose} size={1} />
          </button>
        </span>
        <hr className="text-fg.subtle" />
        <div className="flex flex-col gap-[14px] flex-grow">
          {preview.piece && <Preview piece={preview.piece} />}
        </div>
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
