import { mdiClose, mdiFileOutline, mdiFileSearchOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { useAppDispatch } from "../../../../app/hooks";
import { deleteFile } from "../../filesSlice";

export function Card(props: {
  file: File;
  onMove: (dragIndex: number, hoverIndex: number) => void;
  index: number;
  onMouseEnter: (index: number) => void;
  onMouseLeave: (index: number) => void;
  hovered: boolean;
}) {
  const { file, index, onMouseEnter, onMouseLeave, hovered } = props;

  const dispatch = useAppDispatch();

  function handleMouseEnter() {
    onMouseEnter(index);
  }

  function handleMouseLeave() {
    onMouseLeave(index);
  }

  return (
    <span className="border border-fg.subtle rounded-[4px] px-[14px] py-[8px] flex items-center gap-[14px] w-full">
      <button onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <Icon path={hovered ? mdiFileSearchOutline : mdiFileOutline} size={1} />
      </button>
      <span className="truncate w-full">{file.name}</span>
      <button onClick={() => dispatch(deleteFile({ index }))}>
        <Icon
          path={mdiClose}
          size={1}
          className="text-fg.muted hover:text-fg.default transition-all"
        />
      </button>
    </span>
  );
}
