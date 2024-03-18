import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ActionCreators } from "redux-undo";
import { clearFiles } from "../filesSlice";
import { clearPiece } from "../pieceSlice";
import { DragUpload } from "./DragUpload";
import { FileList } from "./FileList";

export function LeftPanel() {
  const panelRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);

  function handleConfirmCancel() {
    dispatch(clearFiles());
    dispatch(ActionCreators.clearHistory());
    dispatch(clearPiece());
    navigate("/");
  }

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div ref={panelRef} className="p-[14px] flex flex-col h-full gap-[14px]">
          {!loading && (
            <>
              <DragUpload />
              <Separator />
              <FileList />
              <Separator />
              <Dialog>
                <DialogTrigger className="text-left hover:text-fg.0 transirtion-default">
                  Cancel
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure you want to cancel?
                    </DialogTitle>
                    <DialogDescription>
                      You will lose all unsaved changes.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="link">Keep working</Button>
                    </DialogClose>
                    <Button onClick={handleConfirmCancel}>Yes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
    </>
  );
}
