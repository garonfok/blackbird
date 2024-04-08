import { useAppDispatch } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { clearPiece } from "../reducers/previewSlice";
import { Piece } from "@/app/types";

export function Header(props: { piece: Piece }) {

  const { piece } = props;

  const dispatch = useAppDispatch();

  function handleClickClosePreview() {
    dispatch(clearPiece());
  }

  return (
    <span className="flex justify-between items-start py-[14px] gap-[8px] px-[14px]">
      <span className="flex flex-wrap text-body-bold text-fg.0">
        {piece.composers
          .map((composer) =>
            [composer.first_name, composer.last_name].join(" ")
          )
          .join(", ")}
      </span>
      <Button onClick={handleClickClosePreview} variant="sidebar" className="p-1">
        <Icon path={mdiClose} size={1} />
      </Button>
    </span>
  )
}
