import { Combobox, Dialog, Transition } from "@headlessui/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { Fragment, useCallback, useEffect, useState } from "react";
import { Ensemble } from "../app/types";

export function SaveEnsembleModal(props: {
  closeModal: () => void;
  isOpen: boolean;
  onConfirm: (name: string, category: string) => void;
}) {
  const { closeModal, isOpen, onConfirm } = props;

  const [name, setName] = useState("");
  const [categories, setCategories] = useState([""]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const ensembles = (await invoke("ensembles_get_all")) as Ensemble[];
    const categories = Array.from(
      new Set(ensembles.map((ensemble) => ensemble.category))
    );
    setCategories(categories);
  }

  const handleClickSubmit = useCallback(() => {
    onConfirm(name, selectedCategory);
    closeModal();
    setName("");
    setSelectedCategory("");
  }, [name, selectedCategory]);

  const handleClickCloseModal = useCallback(() => {
    closeModal();
    setName("");
    setSelectedCategory("");
  }, []);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={handleClickCloseModal}
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
              <Dialog.Panel className="transform overflow-hidden rounded-[4px] bg-bg.default p-[14px] flex flex-col gap-[14px] shadow-float transition-all text-fg.default">
                <div className="flex flex-col gap-[8px]">
                  <Dialog.Title as="h3" className="text-[20px]">
                    Creating template ensemble
                  </Dialog.Title>
                  <div className="flex flex-col gap-[14px]">
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="name" className="text-fg.muted">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="input-text"
                        placeholder="Required"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="category" className="text-fg.muted">
                        Category
                      </label>
                      <Combobox
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                      >
                        <Combobox.Input
                          className="input-text"
                          value={selectedCategory}
                          onChange={(event) =>
                            setSelectedCategory(event.target.value)
                          }
                        />
                        <Combobox.Options
                          as="ul"
                          className="bg-bg.inset rounded-[4px] border border-bg.inset overflow-y-auto scrollbar-default max-h-60"
                        >
                          {categories.map((category) => (
                            <Combobox.Option
                              key={category}
                              value={category}
                              className="first:rounded-t-[4px] last:rounded-b-[4px] dropdown-item cursor-pointer w-full"
                            >
                              {category}
                            </Combobox.Option>
                          ))}
                        </Combobox.Options>
                      </Combobox>
                    </div>
                  </div>
                </div>
                <hr className="text-fg.subtle" />
                <div className="flex gap-[14px]">
                  <button
                    disabled={name.length === 0}
                    type="button"
                    className={classNames(
                      "border px-[14px] py-[8px] rounded-[4px]   transition-all outline-none",
                      name.length === 0
                        ? "text-fg.subtle border-fg.subtle"
                        : "text-fg.muted hover:bg-fg.default hover:text-bg.inset"
                    )}
                    onClick={handleClickSubmit}
                  >
                    Save
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
