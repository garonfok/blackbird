import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { Modal } from "src/components/Modal";
import { ResizableLeft } from "src/components/ResizeableLeft";
import { clearFiles } from "../filesSlice";
import { clearPiece } from "../pieceSlice";
import { DragUpload } from "./DragUpload";
import { FileList } from "./FileList";
import { ActionCreators } from "redux-undo";

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
      <ResizableLeft minWidth={192} width={256} maxWidth={384}>
        <div ref={panelRef} className="flex flex-col h-full gap-[14px]">
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
      </ResizableLeft>

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
