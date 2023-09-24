import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { Piece } from "src/app/types";
import { Modal } from "src/components/Modal";
import { ResizableRight } from "src/components/ResizeableRight";
import { setPieces } from "../reducers/piecesSlice";
import { clearPiece } from "../reducers/previewSlice";
import { Preview } from "./Preview";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(384);
  const [isConfirmDeletePieceModalOpen, setIsConfirmDeletePieceModalOpen] =
    useState(false);

  const preview = useAppSelector((state) => state.preview);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  async function handleClickOpenDirectory() {
    await invoke("open", { path: preview.piece!.path });
  }

  function handleClickEditPiece() {
    navigate("/edit-wizard", { state: { piece: preview.piece } });
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
            <button
              onClick={handleClickOpenDirectory}
              className="text-left text-fg.muted hover:text-fg.default transition-all"
            >
              Open folder
            </button>
            <button
              onClick={handleClickEditPiece}
              className="text-left text-fg.muted hover:text-fg.default transition-all"
            >
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
