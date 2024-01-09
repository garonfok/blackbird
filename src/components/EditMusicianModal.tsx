import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
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

  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        submitRef.current?.click();
      }
    },
    [submitRef]
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
          <div className="fixed inset-0 bg-[#000] bg-opacity-50" />
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
              <Dialog.Panel className="transform overflow-hidden rounded-default bg-bg.1 p-[14px] flex flex-col gap-[14px] transition-all">
                <div className="flex flex-col gap-[8px]">
                  <Dialog.Title as="h3" className="text-heading-default">
                    {defaultMusician ? "Edit Musician" : "Create Musician"}
                  </Dialog.Title>
                  <div className="text-fg.1 flex flex-col gap-[14px]">
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="firstName" className="text-fg.1">
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
                      <label htmlFor="lastName" className="text-fg.1">
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
                <hr className="text-fg.2" />
                <div className="flex gap-[14px]">
                  <button
                    disabled={firstName.length === 0}
                    ref={submitRef}
                    className={classNames(
                      "rounded-default  px-[8px] py-[8px] flex justify-center items-center gap-2 transition-all",
                      firstName.length === 0
                        ? "text-fg.2 bg-bg.2"
                        : "button-default"
                    )}
                    onClick={handleClickSubmit}
                  >
                    {defaultMusician ? "Save changes" : "Create"}
                  </button>
                  <button className="link" onClick={handleClickCloseModal}>
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
