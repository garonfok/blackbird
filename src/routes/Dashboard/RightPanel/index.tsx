import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { openFolder, openWizard, piecesDelete, piecesGetAll } from "@/app/invokers";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { setPieces } from "../reducers/piecesSlice";
import { clearPiece } from "../reducers/previewSlice";
import { Header } from "./Header";
import { Preview } from "./Preview";

export function RightPanel() {
  const preview = useAppSelector((state) => state.preview);
  const dispatch = useAppDispatch();

  async function handleClickOpenDirectory() {
    await openFolder({ path: preview.piece!.path });
  }

  async function handleClickEditPiece() {
    await openWizard({ pieceId: preview.piece!.id })
  }

  async function handleConfirmDeletePiece() {
    dispatch(clearPiece());
    await piecesDelete({ id: preview.piece!.id });
    await fetchPieces();
  }

  async function fetchPieces() {
    const pieces = await piecesGetAll();
    dispatch(setPieces({ pieces }));
  }

  async function handleClickPrintPiece(pieceId: number) {
    void pieceId
  }

  return (
    <>
      <ResizableHandle />
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="bg-sidebar-bg.default flex flex-col h-full gap-[14px]">
          <Header piece={preview.piece!} />
          <Preview piece={preview.piece!} />
          <div className="flex flex-col gap-[2px] px-[14px] pb-[14px]">
            <Button
              onClick={handleClickOpenDirectory}
              variant="sidebar"
              className="text-left"
            >
              Open folder
            </Button>
            <Button
              onClick={handleClickEditPiece}
              className="text-left"
              variant="sidebar"
            >
              Edit data
            </Button>
            <Button
              className="text-left"
              variant="sidebar"
              onClick={() => handleClickPrintPiece(preview.piece!.id)}
            >
              Print piece
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="text-left text-error.default hover:text-error.focus" variant="sidebar">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this piece?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleConfirmDeletePiece();
                    }}
                  >
                    <Button type="submit">
                      Delete
                    </Button>
                  </form>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </ResizablePanel>
    </>
  );
}
