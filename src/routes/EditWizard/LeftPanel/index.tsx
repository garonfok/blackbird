import { useEffect, useRef, useState } from "react";
import { Modal } from "../../../components/Modal";
import { ResizableLeft } from "../../../components/ResizeableLeft";
import { DragUpload } from "./DragUpload";
import { FileList } from "./FileList";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { clearFiles } from "../filesSlice";

export function LeftPanel() {
  const [isPanelSmall, setPanelSmall] = useState(false);
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setPanelSmall(entry.contentRect.width < 256);
      }
    });

    resizeObserver.observe(panelRef.current!);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  function handleConfirmCancel() {
    setConfirmingCancel(false);
    resetEditor();
    navigate("/");
  }

  function resetEditor() {
    dispatch(clearFiles());
  }

  return (
    <>
      <ResizableLeft minWidth={192} width={256} maxWidth={384}>
        <div ref={panelRef} className="flex flex-col h-full gap-[14px]">
          <DragUpload isPanelSmall={isPanelSmall} />
          <FileList />
          <hr className="text-fg.subtle" />
          <button
            className="text-left text-fg.muted hover:text-fg.default"
            onClick={() => setConfirmingCancel(true)}
          >
            Cancel
          </button>
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
