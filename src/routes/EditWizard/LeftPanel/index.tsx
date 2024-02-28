import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Modal } from "@/components/Modal";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ActionCreators } from "redux-undo";
import { clearFiles } from "../filesSlice";
import { clearPiece } from "../pieceSlice";
import { DragUpload } from "./DragUpload";
import { FileList } from "./FileList";

export function LeftPanel() {
  const [isPanelSmall, setPanelSmall] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loading);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPanelSmall(entry.contentRect.width < 256);
      }
    });
    document.addEventListener("keydown", handleKeyDown);
    resizeObserver.observe(panelRef.current!);

    return () => {
      resizeObserver.disconnect();
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape") {
      setConfirmingCancel(true);
    }
  }

  function handleConfirmCancel() {
    setConfirmingCancel(false);
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
              <DragUpload isPanelSmall={isPanelSmall} />
              <FileList />
              <hr className="text-divider" />
              <button
                className="text-left outline-none link"
                onClick={() => setConfirmingCancel(true)}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle withHandle />
      <Modal
        title="Are you sure you want to cancel?"
        isOpen={confirmingCancel}
        confirmText="Yes"
        cancelText="Keep working"
        closeModal={() => setConfirmingCancel(false)}
        onConfirm={handleConfirmCancel}
      >
        You will lose all unsaved changes.
      </Modal>
    </>
  );
}
