import { Transition, Dialog } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

export function Modal(props: {
  isOpen: boolean;
  onConfirm: () => void;
  closeModal: () => void;
  title?: string;
  confirmText?: string;
  cancelText?: string;
  children: ReactNode;
}) {
  const {
    isOpen,
    onConfirm,
    closeModal,
    title,
    confirmText,
    cancelText,
    children,
  } = props;
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-10" />
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
                <hr className="text-fg.subtle" />
                <div className="flex gap-[14px]">
                  <button
                    type="button"
                    className="text-fg.muted border px-[14px] py-[8px] rounded-[4px] hover:bg-fg.default hover:text-bg.inset transition-all"
                    onClick={onConfirm}
                  >
                    {confirmText || "Okay"}
                  </button>
                  {cancelText && (
                    <button
                      type="button"
                      className="text-fg.muted hover:text-fg.default transition-all"
                      onClick={closeModal}
                    >
                      {cancelText}
                    </button>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
