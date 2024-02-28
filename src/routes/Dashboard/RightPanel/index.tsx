import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Piece } from "@/app/types";
import { Modal } from "@/components/Modal";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setPieces } from "../reducers/piecesSlice";
import { clearPiece } from "../reducers/previewSlice";
import { Preview } from "./Preview";

export function RightPanel() {
  const [isConfirmDeletePieceModalOpen, setIsConfirmDeletePieceModalOpen] =
    useState(false);

  const preview = useAppSelector((state) => state.preview);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="p-[14px] flex flex-col h-full gap-[14px]">
          <span className="flex justify-end items-center py-[8px]">
            <button onClick={handleClickClearPreview} className="link">
              <Icon path={mdiClose} size={1} />
            </button>
          </span>
          <div className="flex flex-col gap-[14px] flex-grow">
            {preview.piece && <Preview piece={preview.piece} />}
          </div>
          <hr className="text-divider" />
          <div className="flex flex-col gap-[8px]">
            <button
              onClick={handleClickOpenDirectory}
              className="text-left link"
            >
              Open folder
            </button>
            <button onClick={handleClickEditPiece} className="text-left link">
              Edit data
            </button>
            <button className="text-left link">Print parts</button>
            <button
              onClick={handleClickDelete}
              className="text-left text-error.default hover:text-error.default link"
            >
              Delete
            </button>
          </div>
        </div>
      </ResizablePanel>
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
