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
    console.log("Fetched categories");
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
              <Dialog.Panel className="transform rounded-default bg-bg.1 p-[14px] flex flex-col gap-[14px] transition-all">
                <div className="flex flex-col gap-[8px]">
                  <Dialog.Title as="h3" className="text-heading-default">
                    Creating new template ensemble
                  </Dialog.Title>
                  <div className="text-fg.1 flex flex-col gap-[14px]">
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="name" className="text-fg.1">
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        className="input-text"
                        placeholder="Required"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-[8px]">
                      <label htmlFor="category" className="text-fg.1">
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
                        <div className="relative">
                          <Combobox.Options
                            as="ul"
                            className="dropdown w-full overflow-y-auto scrollbar-default max-h-60"
                          >
                            {categories.map((category) => (
                              <Combobox.Option
                                key={category}
                                value={category}
                                className="dropdown-item cursor-pointer"
                              >
                                {category}
                              </Combobox.Option>
                            ))}
                          </Combobox.Options>
                        </div>
                      </Combobox>
                    </div>
                  </div>
                </div>
                <hr className="text-fg.2" />
                <div className="flex gap-[14px]">
                  <button
                    disabled={name.length === 0}
                    type="button"
                    className={classNames(
                      "rounded-default  px-[8px] py-[8px] flex justify-center items-center gap-2 transition-all",
                      name.length === 0 ? "text-fg.2 bg-bg.2" : "button-default"
                    )}
                    onClick={handleClickSubmit}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="link"
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
