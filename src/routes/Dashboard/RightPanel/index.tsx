import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Piece } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useNavigate } from "react-router-dom";
import { setPieces } from "../reducers/piecesSlice";
import { clearPiece } from "../reducers/previewSlice";
import { Preview } from "./Preview";

export function RightPanel() {
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

  async function handleConfirmDeletePiece() {
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
            <Dialog>
              <DialogTrigger className="text-error.default hover:text-error.default text-left">
                Delete
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this piece?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone!
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose>
                    <Button variant="link">Cancel</Button>
                  </DialogClose>
                  <DialogClose>
                    <Button onClick={handleConfirmDeletePiece}>Delete</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </ResizablePanel>
    </>
  );
}
