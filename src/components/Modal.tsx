import { Dialog, Transition } from "@headlessui/react";
import {
  Fragment,
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
} from "react";

export function Modal(
  props: PropsWithChildren<{
    isOpen: boolean;
    onConfirm: (...args: any[]) => void;
    closeModal: () => void;
    title?: string;
    confirmText?: string;
    cancelText?: string;
  }>
) {
  const {
    isOpen,
    onConfirm,
    closeModal,
    title,
    confirmText,
    cancelText,
    children,
  } = props;

  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        submitRef.current?.click();
      }
    },
    [submitRef]
  );

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10 select-none"
        onClose={closeModal}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex h-full items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-150"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[4px] bg-bg.default p-[14px] flex flex-col gap-[14px] shadow-float transition-all text-fg.default">
                <div className="flex flex-col gap-[8px]">
                  {title && (
                    <Dialog.Title as="h3" className="text-[20px]">
                      {title}
                    </Dialog.Title>
                  )}
                  <div className="text-fg.muted">{children}</div>
                </div>
                {(confirmText || cancelText) && (
                  <>
                    <hr className="text-fg.subtle" />
                    <div className="flex gap-[14px]">
                      <button
                        ref={submitRef}
                        type="button"
                        className="text-fg.muted border px-[14px] py-[8px] rounded-[4px] hover:bg-fg.default hover:text-bg.inset transition-all outline-none"
                        onClick={onConfirm}
                      >
                        {confirmText}
                      </button>
                      {cancelText && (
                        <button
                          className="text-fg.muted hover:text-fg.default transition-all"
                          onClick={closeModal}
                        >
                          {cancelText}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
