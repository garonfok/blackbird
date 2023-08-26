import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Tag } from "../app/types";
import { getContrast } from "../app/utils";

type Colors = {
  [key: string]: [string, string, string, string];
};

const COLORS: Colors = {
  RED: ["#FBADA6", "#ee5245", "#B8291D", "#7E251E"],
  ORANGE: ["#FCBC75", "#f87717", "#C1440D", "#7C2F12"],
  YELLOW: ["#f0ee54", "#d8c518", "#967312", "#6a4b19"],
  GREEN: ["#86efb7", "#22c56f", "#158048", "#145334"],
  BLUE: ["#84cdf5", "#1a9add", "#0c6198", "#114669"],
  VIOLET: ["#e0c1e0", "#b97bb5", "#8a4c81", "#62395c"],
};

export function EditTagModal(props: {
  defaultTag?: Tag;
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: (name: string, color: string) => void;
}) {
  const { defaultTag, isOpen, closeModal, onConfirm } = props;
  const [name, setName] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  const submitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!defaultTag) return;
    setName(defaultTag.name);
    setSelectedColor(defaultTag.color);
  }, [defaultTag]);

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
    setName("");
    setSelectedColor("");
  }, []);

  const handleClickSubmit = useCallback(() => {
    if (!name || !selectedColor) return;
    onConfirm(name, selectedColor);
    closeModal();
    setName("");
    setSelectedColor("");
  }, [name, selectedColor]);

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
                    {defaultTag ? "Edit Tag" : "Create Tag"}
                  </Dialog.Title>

                  <div className="flex flex-col gap-[14px]">
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
                    <div className="flex flex-row justify-center gap-2">
                      {Object.keys(COLORS).map((color) => (
                        <div key={color} className="flex flex-col gap-2">
                          {COLORS[color].map((shade) => (
                            <div
                              key={shade}
                              className={classNames(
                                "h-[24px] w-[24px] cursor-pointer rounded-full transition-all hover:scale-110",
                                getContrast("#333238", shade) > 0.6 &&
                                  selectedColor !== shade &&
                                  "ring-inset ring-1 ring-fg.subtle",
                                selectedColor === shade &&
                                  "scale-110 ring-2 ring-fg.default"
                              )}
                              style={{
                                backgroundColor: shade,
                              }}
                              onClick={() => setSelectedColor(shade)}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <hr className="text-fg.subtle" />
                <div className="flex gap-[14px]">
                  <button
                    ref={submitRef}
                    disabled={!name || !selectedColor}
                    className={classNames(
                      "border px-[14px] py-[8px] rounded-[4px]   transition-all outline-none",
                      !name || !selectedColor
                        ? "text-fg.subtle border-fg.subtle"
                        : "text-fg.muted hover:bg-fg.default hover:text-bg.inset"
                    )}
                    onClick={handleClickSubmit}
                  >
                    {defaultTag ? "Save changes" : "Create"}
                  </button>
                  <button
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
