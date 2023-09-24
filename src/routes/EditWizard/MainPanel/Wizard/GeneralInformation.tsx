import { Listbox } from "@headlessui/react";
import { mdiCheck, mdiChevronDown, mdiClose, mdiPlus, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api/tauri";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { Tag } from "src/app/types";
import { EditTagModal } from "src/components/EditTagModal";
import {
  setDifficulty,
  setNotes,
  setTags,
  setTitle,
  setYearPublished,
} from "../../pieceSlice";
import { SelectMusicians } from "./components/SelectMusician";

const MAX_DIFFICULTY = 6;

export function GeneralInformation() {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);

  const piece = useAppSelector((state) => state.piece);
  const dispatch = useAppDispatch();

  const tagDropdownRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    const tags = (await invoke("tags_get_all")) as Tag[];
    setAllTags(tags);
  }

  function handleClickRemoveTag(tagId: number) {
    const filtered = piece.tags.filter((tag) => tag.id !== tagId);
    dispatch(setTags(filtered));
  }

  async function handleConfirmCreateTag(name: string, color: string) {
    const tagId = await invoke("tags_add", { name, color });
    await fetchTags();
    const tag = (await invoke("tags_get_by_id", { id: tagId })) as Tag;
    dispatch(setTags([...piece.tags, tag]));

    tagDropdownRef.current?.blur();
    setIsEditTagModalOpen(false);
  }

  const handleChangeYearPublished = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.value === "") {
        dispatch(setYearPublished(undefined));
        return;
      }
      const yearPublished = parseInt(event.currentTarget.value);
      if (isNaN(yearPublished)) return;
      dispatch(setYearPublished(yearPublished));
    },
    []
  );

  const handleClickOpenEditTagModal = useCallback(() => {
    setIsEditTagModalOpen(true);
  }, []);

  return (
    <>
      <div className="edit-wizard-panel">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="title" className="text-fg.muted w-fit">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="input-text"
            placeholder="Required"
            required
            value={piece.title}
            onChange={(event) => dispatch(setTitle(event.currentTarget.value))}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="yearPublished" className="text-fg.muted w-fit">
            Year Published
          </label>
          <input
            id="yearPublished"
            type="number"
            className="input-text [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            max={9999}
            value={piece.yearPublished}
            onInput={(event) =>
              (event.currentTarget.value = event.currentTarget.value.slice(
                0,
                4
              ))
            }
            onChange={handleChangeYearPublished}
          />
        </div>
        <SelectMusicians role="composer" />
        <div className="flex flex-col gap-[8px]">
          <span className="text-fg.muted w-fit">Difficulty</span>
          <Listbox
            value={piece.difficulty}
            onChange={(value) => dispatch(setDifficulty(value))}
          >
            {({ open }) => (
              <div className="relative w-full">
                <Listbox.Button className="input-text flex justify-between w-full">
                  <span>{piece.difficulty}</span>
                  <Icon
                    path={mdiChevronDown}
                    size={1}
                    className={classNames(
                      "transition-all",
                      open && "rotate-180"
                    )}
                  />
                </Listbox.Button>
                <Listbox.Options className="absolute border border-bg.inset rounded-[4px] overflow-clip w-full mt-[8px] z-10">
                  <Listbox.Option
                    value={null}
                    className={({ active }) =>
                      classNames(
                        "dropdown-item italic",
                        active && "bg-bg.default text-fg.default"
                      )
                    }
                  >
                    None
                  </Listbox.Option>
                  {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
                    <Listbox.Option
                      key={i}
                      value={i + 1}
                      className={({ active }) =>
                        classNames(
                          "dropdown-item",
                          active && "bg-bg.default text-fg.default"
                        )
                      }
                    >
                      {i + 1}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            )}
          </Listbox>
        </div>
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="notes" className="text-fg.muted w-fit">
            Notes
          </label>
          <textarea
            id="notes"
            rows={6}
            className="input-text resize-none"
            onChange={(event) => dispatch(setNotes(event.currentTarget.value))}
            value={piece.notes}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <span className="text-fg.muted w-fit">Tags</span>
          <Listbox
            multiple
            value={piece.tags}
            onChange={(tags) => dispatch(setTags(tags))}
          >
            {({ open }) => (
              <div className="relative w-full">
                <Listbox.Button
                  ref={tagDropdownRef}
                  className="input-text flex gap-[14px] w-full"
                >
                  <div className="flex-wrap gap-[8px] w-full flex">
                    {piece.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className={classNames(
                          "px-[14px] py-[8px] rounded-[4px] flex items-center gap-[8px] bg-bg.default"
                        )}
                      >
                        <Icon path={mdiTag} size={1} color={tag.color} />
                        {tag.name}
                        <button onClick={() => handleClickRemoveTag(tag.id)}>
                          <Icon
                            path={mdiClose}
                            size={1}
                            className="text-fg.muted hover:text-fg.default transition-all"
                          />
                        </button>
                      </span>
                    ))}
                  </div>
                  <Icon
                    path={mdiChevronDown}
                    size={1}
                    className={classNames(
                      "transition-all",
                      open && "rotate-180"
                    )}
                  />
                </Listbox.Button>
                <Listbox.Options className="absolute border border-bg.inset rounded-[4px] overflow-clip w-full mt-[8px]">
                  {allTags.map((tag) => (
                    <Listbox.Option
                      key={tag.id}
                      value={tag}
                      className={({ active }) =>
                        classNames(
                          "input-text rounded-none flex items-center gap-[8px]",
                          active && "bg-bg.default text-fg.default"
                        )
                      }
                    >
                      <Icon path={mdiTag} size={1} color={tag.color} />
                      <span className="w-full">{tag.name}</span>
                      {piece.tags.map((t) => t.id).includes(tag.id) && (
                        <Icon path={mdiCheck} size={1} />
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
                <button
                  className="px-[14px] py-[8px] text-fg.muted hover:text-fg.default transition-all text-left flex items-center gap-[8px]"
                  onClick={handleClickOpenEditTagModal}
                >
                  <Icon path={mdiPlus} size={1} />
                  <span>Create tag</span>
                </button>
              </div>
            )}
          </Listbox>
        </div>
      </div>
      <EditTagModal
        isOpen={isEditTagModalOpen}
        closeModal={() => setIsEditTagModalOpen(false)}
        onConfirm={handleConfirmCreateTag}
      />
    </>
  );
}
