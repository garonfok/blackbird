import { useCallback, useEffect, useRef, useState } from "react";
import { Modal } from "./Modal";
import { invoke } from "@tauri-apps/api";
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
  const [isInputFocused, setIsInputFocused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function fetchCategories() {
    const ensembles = (await invoke("ensembles_get_all")) as Ensemble[];
    const categories = Array.from(
      new Set(ensembles.map((ensemble) => ensemble.category))
    );
    setCategories(categories);
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
          <label htmlFor="title" className="text-fg.muted">
            Name
          </label>
          <input
            id="title"
            type="text"
            className="input-text"
            placeholder="Required"
            required
            onChange={(event) => setName(event.target.value)}
            onFocus={() => setIsInputFocused(true)}
          />
        </div>
      </div>
    </Modal>
  );
}
