import { Combobox } from "@headlessui/react";
import { invoke } from "@tauri-apps/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ensemble } from "../app/types";
import { Modal } from "./Modal";

export function SaveEnsembleModal(props: {
  closeModal: () => void;
  isOpen: boolean;
  onConfirm: (name: string, category: string) => void;
}) {
  const { closeModal, isOpen, onConfirm } = props;

  const [name, setName] = useState("");
  const [categories, setCategories] = useState([""]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    console.log("focus changed", isInputFocused);
  }, [isInputFocused]);

  async function fetchCategories() {
    const ensembles = (await invoke("ensembles_get_all")) as Ensemble[];
    const categories = Array.from(
      new Set(ensembles.map((ensemble) => ensemble.category))
    );
    setCategories(categories);
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      console.log("outside click event fired");
      setIsInputFocused(false);
    }
  }, []);

  return (
    <Modal
      closeModal={closeModal}
      isOpen={isOpen}
      onConfirm={() => onConfirm(name, name)}
      title="Creating template ensemble"
      cancelText="Cancel"
      confirmText="Save"
    >
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
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="category" className="text-fg.muted">
            Category
          </label>
          {/* <input
            ref={inputRef}
            id="category"
            type="text"
            className={classNames("input-text", isInputFocused && "border")}
            onChange={(event) => setSelectedCategory(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
          /> */}
          <Combobox value={selectedCategory} onChange={setSelectedCategory}>
            <Combobox.Input
              className="input-text"
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
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
    </Modal>
  );
}
