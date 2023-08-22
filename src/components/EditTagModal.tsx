import { Dialog, Transition } from "@headlessui/react";
import classNames from "classnames";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Tag } from "../app/types";

type Colors = {
  [key: string]: {
    [key: string]: string;
  };
};

const COLORS: Colors = {
  RED: {
    "50": "#fef3f2",
    "100": "#fee4e2",
    "200": "#fececa",
    "300": "#fcaca5",
    "400": "#f88379",
    "500": "#ee5245",
    "600": "#db3527",
    "700": "#b9281c",
    "800": "#99251b",
    "900": "#7f251d",
    "950": "#450f0a",
  },
  ORANGE: {
    "50": "#fff7ed",
    "100": "#ffeed5",
    "200": "#fed8aa",
    "300": "#fdbc74",
    "400": "#fba254",
    "500": "#f87717",
    "600": "#e95c0d",
    "700": "#c1440d",
    "800": "#9a3612",
    "900": "#7c2f12",
    "950": "#431507",
  },
  YELLOW: {
    "50": "#fafcea",
    "100": "#f5fac7",
    "200": "#f0f692",
    "300": "#ecf054",
    "400": "#ebe831",
    "500": "#dacf18",
    "600": "#bca412",
    "700": "#967812",
    "800": "#7d6016",
    "900": "#6a4e19",
    "950": "#3e2b0a",
  },
  GREEN: {
    "50": "#f0fdf5",
    "100": "#dcfcea",
    "200": "#bbf7d6",
    "300": "#86efb7",
    "400": "#41dc8a",
    "500": "#22c56f",
    "600": "#16a359",
    "700": "#158048",
    "800": "#16653c",
    "900": "#145334",
    "950": "#052e1a",
  },
  BLUE: {
    "50": "#f1f9fe",
    "100": "#e2f1fc",
    "200": "#bee3f9",
    "300": "#84cef5",
    "400": "#5ebff0",
    "500": "#1a9add",
    "600": "#0d7cbc",
    "700": "#0c6298",
    "800": "#0e547e",
    "900": "#114769",
    "950": "#0c2c45",
  },
  VIOLET: {
    "50": "#faf5fa",
    "100": "#f5eef5",
    "200": "#eddded",
    "300": "#e0c1e0",
    "400": "#cb99c9",
    "500": "#b97bb5",
    "600": "#a35f9b",
    "700": "#8b4b82",
    "800": "#73416b",
    "900": "#62395c",
    "950": "#391e35",
  },
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

  useEffect(() => {
    if (!defaultTag) return;
    setName(defaultTag.name);
    setSelectedColor(defaultTag.color);
  }, [defaultTag]);

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
                          {Object.keys(COLORS[color])
                            .filter(
                              (shade) =>
                                parseInt(shade) >= 500 && parseInt(shade) <= 800
                            )
                            .map((shade) => (
                              <div
                                key={COLORS[color][shade]}
                                className={classNames(
                                  "h-[24px] w-[24px] cursor-pointer rounded-full transition-all hover:scale-110",
                                  selectedColor === COLORS[color][shade] &&
                                    "scale-110 ring-2 ring-fg.default"
                                )}
                                style={{
                                  backgroundColor: COLORS[color][shade],
                                }}
                                onClick={() =>
                                  setSelectedColor(COLORS[color][shade])
                                }
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
                    disabled={!name || !selectedColor}
                    type="button"
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
