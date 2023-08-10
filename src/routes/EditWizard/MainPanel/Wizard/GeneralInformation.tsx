import { Listbox } from "@headlessui/react";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import {
  mdiCheck,
  mdiChevronDown,
  mdiClose,
  mdiDragVertical,
  mdiPlus,
  mdiTag,
} from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api/tauri";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { Musician, Tag } from "../../../../app/types";
import { EditMusicianModal } from "../../../../components/EditMusicianModal";
import { EditTagModal } from "../../../../components/EditTagModal";
import {
  setComposers,
  setDifficulty,
  setNotes,
  setTags,
  setTitle,
  setYearPublished,
} from "../../pieceSlice";

const MAX_DIFFICULTY = 6;

export function GeneralInformation() {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [musicians, setMusicians] = useState<Musician[]>([]);
  const [composerQuery, setComposerQuery] = useState("");
  const [isEditTagModalOpen, setIsEditTagModalOpen] = useState(false);
  const [isEditMusicianModalOpen, setIsEditMusicianModalOpen] = useState(false);
  const [isComposersFocused, setIsComposersFocused] = useState(false);

  const piece = useAppSelector((state) => state.piece);
  const dispatch = useAppDispatch();

  const tagDropdownRef = useRef<HTMLButtonElement>(null);
  const composerInputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTags();
    fetchMusicians();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      composerInputRef.current &&
      !composerInputRef.current.contains(event.target as Node)
    ) {
      setIsComposersFocused(false);
    }
  }, []);

  async function fetchTags() {
    const tags = (await invoke("tags_get_all")) as Tag[];
    setAllTags(tags);
  }

  async function fetchMusicians() {
    const musicians = (await invoke("musicians_get_all")) as Musician[];
    setMusicians(musicians);
  }

  async function handleConfirmCreateTag(name: string, color: string) {
    const tagId = await invoke("tags_add", { name, color });
    await fetchTags();
    const tag = (await invoke("tags_get_by_id", { id: tagId })) as Tag;
    dispatch(setTags([...piece.tags, tag]));

    tagDropdownRef.current?.blur();
    setIsEditTagModalOpen(false);
  }

  async function handleConfirmCreateMusician(
    firstName: string,
    lastName?: string
  ) {
    const musicianId = await invoke("musicians_add", { firstName, lastName });
    await fetchMusicians();
    const musician = (await invoke("musicians_get_by_id", {
      id: musicianId,
    })) as Musician;
    dispatch(setComposers([...piece.composers, musician]));
    composerInputRef.current?.blur();
    setIsEditMusicianModalOpen(false);
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

  const handleClickOpenEditMusicianModal = useCallback(() => {
    setIsEditMusicianModalOpen(true);
  }, []);

  const handleClickRemoveTag = useCallback((tagId: number) => {
    const filtered = piece.tags.filter((tag) => tag.id !== tagId);
    dispatch(setTags(filtered));
  }, []);

  function handleClickSelectComposer(composer: Musician) {
    if (!piece.composers.map((c) => c.id).includes(composer.id)) {
      dispatch(setComposers([...piece.composers, composer]));
    } else {
      dispatch(
        setComposers(piece.composers.filter((c) => c.id !== composer.id))
      );
    }
  }

  function handleClickRemoveComposer(composerId: number) {
    const filtered = piece.composers.filter(
      (composer) => composer.id !== composerId
    );

    dispatch(setComposers(filtered));
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const cloned = [...piece.composers];
    const file = cloned[source.index];
    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, file);

    dispatch(setComposers(cloned));
  }

  const filteredComposers = musicians.filter((musician) => {
    const fullName = `${musician.first_name} ${musician.last_name}`;
    return fullName.toLowerCase().includes(composerQuery.toLowerCase());
  });

  return (
    <>
      <div className="edit-wizard-panel">
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="title" className="text-fg.muted">
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
          <label htmlFor="yearPublished" className="text-fg.muted">
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
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="title" className="text-fg.muted">
            Composers
          </label>
          <div ref={composerInputRef} className="w-full relative">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId={"droppable"} direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={classNames(
                      "input-text flex-wrap flex gap-[14px]",
                      isComposersFocused &&
                        "ring-1 ring-inset transition-all ring-fg.default"
                    )}
                  >
                    {piece.composers.map((composer, index) => (
                      <Draggable
                        key={composer.id}
                        draggableId={composer.id.toString()}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <span
                              key={composer.id}
                              className="px-[14px] py-[8px] rounded-[4px] flex items-center gap-[8px] bg-bg.default w-fit"
                            >
                              <span className="flex gap-[2px]">
                                <Icon
                                  path={mdiDragVertical}
                                  size={1}
                                  className="ml-[-10px] text-fg.muted"
                                />
                                {composer.first_name} {composer.last_name}
                              </span>
                              <button
                                onClick={() =>
                                  handleClickRemoveComposer(composer.id)
                                }
                              >
                                <Icon
                                  path={mdiClose}
                                  size={1}
                                  className="text-fg.muted hover:text-fg.default transition-all"
                                />
                              </button>
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <input
                      type="text"
                      className="flex-grow bg-transparent outline-none"
                      onChange={(event) =>
                        setComposerQuery(event.currentTarget.value)
                      }
                      value={composerQuery}
                      onFocus={() => setIsComposersFocused(true)}
                    />
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {isComposersFocused && (
              <div className="absolute left-0 mt-[14px] rounded-[4px] bg-bg.inset w-full">
                {filteredComposers.length > 0 ? (
                  <div className="flex flex-col rounded-[4px] border-bg.inset border overflow-clip">
                    {filteredComposers.map((musician) => (
                      <button
                        key={musician.id}
                        className="dropdown-item text-left"
                        onClick={() => handleClickSelectComposer(musician)}
                      >
                        {musician.first_name} {musician.last_name}
                        {piece.composers
                          .map((c) => c.id)
                          .includes(musician.id) && (
                          <Icon
                            path={mdiCheck}
                            size={1}
                            className="float-right"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="px-[14px] py-[8px] text-fg.subtle">
                    No results
                  </div>
                )}
              </div>
            )}
            <button
              className="px-[14px] py-[8px] text-fg.muted hover:text-fg.default transition-all text-left flex items-center gap-[8px]"
              onClick={handleClickOpenEditMusicianModal}
            >
              <Icon path={mdiPlus} size={1} />
              <span>Create musician</span>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-[8px]">
          <span className="text-fg.muted">Difficulty</span>
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
                        "dropdown-item italic text-fg.muted",
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
          <label htmlFor="notes" className="text-fg.muted">
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
          <span className="text-fg.muted">Tags</span>
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
      <EditMusicianModal
        isOpen={isEditMusicianModalOpen}
        closeModal={() => setIsEditMusicianModalOpen(false)}
        onConfirm={handleConfirmCreateMusician}
      />
    </>
  );
}
