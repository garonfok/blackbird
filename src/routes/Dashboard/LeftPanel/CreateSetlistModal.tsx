import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useState } from "react";

export function CreateSetlistModal(props: {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: (name: string) => void;
}) {
  const { isOpen, closeModal, onConfirm } = props;
  const [name, setName] = useState("");

  function handleClickCloseModal() {
    closeModal();
    setName("");
  }

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
              <Dialog.Panel className="transform w-full max-w-md overflow-hidden rounded-[4px] bg-bg.default p-[14px] flex flex-col gap-[14px] shadow-float transition-all text-fg.default">
                <div className="flex flex-col gap-[8px]">
                  <div className="flex flex-col gap-[8px] text-fg.muted">
                    <label htmlFor="name" className="text-fg.muted">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="input-text"
                      onChange={(e) => setName(e.target.value)}
                      value={name}
                      size={1}
                    />
                  </div>
                </div>
                <hr className="text-fg.subtle" />
                <div className="flex gap-[14px]">
                  <button
                    disabled={!name}
                    type="button"
                    className={classNames(
                      "border px-[14px] py-[8px] rounded-[4px]   transition-all outline-none",
                      !name
                        ? "text-fg.subtle border-fg.subtle"
                        : "text-fg.muted hover:bg-fg.default hover:text-bg.inset"
                    )}
                    onClick={() => onConfirm(name)}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="text-fg.muted hover:text-fg.default transition-all"
                    onClick={handleClickCloseModal}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
