import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useCallback, useState } from "react";
import { Musician } from "../app/types";

export function EditMusicianModal(props: {
  defaultMusician?: Musician;
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: (firstName: string, lastName?: string) => void;
}) {
  const { defaultMusician, isOpen, closeModal, onConfirm } = props;

  const [firstName, setFirstName] = useState<string>(
    defaultMusician?.first_name || ""
  );
  const [lastName, setLastName] = useState<string>(
    defaultMusician?.last_name || ""
  );

  const handleClickCloseModal = useCallback(() => {
    closeModal();
    setFirstName("");
    setLastName("");
  }, []);

  const handleClickSubmit = useCallback(() => {
    if (firstName.length === 0) return;
    const nulledLastName = lastName.length === 0 ? undefined : lastName;
    onConfirm(firstName, nulledLastName);
    closeModal();
    setFirstName("");
    setLastName("");
  }, [firstName, lastName]);

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
              <Dialog.Panel className="transform overflow-hidden rounded-[4px] bg-bg.default p-[14px] flex flex-col gap-[14px] shadow-float transition-all text-fg.default">
                <div className="flex flex-col gap-[8px]">
                  <Dialog.Title as="h3" className="text-[20px]">
                    {defaultMusician ? "Edit Musician" : "Create Musician"}
                  </Dialog.Title>
                  <div className="text-fg.muted flex flex-col gap-[14px]">
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="firstName" className="text-fg.muted">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        className="input-text"
                        placeholder="Required"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="lastName" className="text-fg.muted">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        className="input-text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <hr className="text-fg.subtle" />
                <div className="flex gap-[14px]">
                  <button
                    disabled={firstName.length === 0}
                    type="button"
                    className={classNames(
                      "border px-[14px] py-[8px] rounded-[4px]   transition-all outline-none",
                      firstName.length === 0
                        ? "text-fg.subtle border-fg.subtle"
                        : "text-fg.muted hover:bg-fg.default hover:text-bg.inset"
                    )}
                    onClick={handleClickSubmit}
                  >
                    {defaultMusician ? "Save changes" : "Create"}
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
