import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { ResizableRight } from "../../../components/ResizeableRight";
import { clearPiece } from "../reducers/previewSlice";
import { Preview } from "./Preview";
import { Modal } from "../../../components/Modal";
import { invoke } from "@tauri-apps/api";
import { Piece } from "../../../app/types";
import { setPieces } from "../reducers/piecesSlice";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(384);
  const [isConfirmDeletePieceModalOpen, setIsConfirmDeletePieceModalOpen] =
    useState(false);

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

  function handleClickDelete() {
    setIsConfirmDeletePieceModalOpen(true);
  }

  function handleCancelDeletePiece() {
    setIsConfirmDeletePieceModalOpen(false);
  }

  async function handleConfirmDeletePiece() {
    setIsConfirmDeletePieceModalOpen(false);
    dispatch(clearPiece());
    await invoke("pieces_delete", { id: preview.piece!.id });
    await fetchPieces();
  }

  async function fetchPieces() {
    const pieces = (await invoke("pieces_get_all")) as Piece[];
    dispatch(setPieces({ pieces }));
  }

  return (
    <>
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
            <button
              onClick={handleClickDelete}
              className="text-left text-danger.default hover:text-danger.emphasis transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </ResizableRight>
      <Modal
        closeModal={handleCancelDeletePiece}
        isOpen={isConfirmDeletePieceModalOpen}
        onConfirm={handleConfirmDeletePiece}
        cancelText="Cancel"
        title="Are you sure you want to delete this piece?"
        confirmText="Delete"
      >
        This cannot be undone!
      </Modal>
    </>
  );
}
