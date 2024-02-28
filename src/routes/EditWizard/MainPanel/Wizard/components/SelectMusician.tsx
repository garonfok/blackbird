import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { mdiCheck, mdiClose, mdiDragVertical, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Musician } from "@/app/types";
import { EditMusicianModal } from "@/components/EditMusicianModal";
import {
  setArrangers,
  setComposers,
  setLyricists,
  setOrchestrators,
  setTranscribers,
} from "../../../pieceSlice";
import { setMusicians } from "../musiciansSlice";

export function SelectMusicians(props: {
  role: "composer" | "arranger" | "transcriber" | "orchestrator" | "lyricist";
}) {
  const { role } = props;

  const [isFocused, setIsFocused] = useState(false);
  const [isEditMusicianModalOpen, setIsEditMusicianModalOpen] = useState(false);

  const [query, setQuery] = useState("");
  const piece = useAppSelector((state) => state.piece.present);

  const dispatch = useAppDispatch();
  const musicians = useAppSelector((state) => state.musicians);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMusicians();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function getRoleMusicians() {
    switch (role) {
      case "composer":
        return piece.composers;
      case "arranger":
        return piece.arrangers;
      case "transcriber":
        return piece.transcribers;
      case "orchestrator":
        return piece.orchestrators;
      case "lyricist":
        return piece.lyricists;
      default:
        throw new Error("Invalid role");
    }
  }

  function setRoleMusicians(musicians: Musician[]) {
    switch (role) {
      case "composer":
        dispatch(setComposers(musicians));
        break;
      case "arranger":
        dispatch(setArrangers(musicians));
        break;
      case "transcriber":
        dispatch(setTranscribers(musicians));
        break;
      case "orchestrator":
        dispatch(setOrchestrators(musicians));
        break;
      case "lyricist":
        dispatch(setLyricists(musicians));
        break;
      default:
        throw new Error("Invalid role");
    }
  }

  async function fetchMusicians() {
    const fetchedMusicians = (await invoke("musicians_get_all")) as Musician[];

    dispatch(setMusicians({ musicians: fetchedMusicians }));
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
    setRoleMusicians([...getRoleMusicians(), musician]);
    inputRef.current?.blur();
    setIsEditMusicianModalOpen(false);
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsFocused(false);
    }
  }, []);

  const handleClickOpenEditMusicianModal = useCallback(() => {
    setIsEditMusicianModalOpen(true);
  }, []);

  function handleDragEnd(result: DropResult) {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const cloned = [...getRoleMusicians()];
    const file = cloned[source.index];
    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, file);

    setRoleMusicians(cloned);
  }

  function handleClickRemoveMusician(musicianId: number) {
    const filtered = getRoleMusicians().filter(
      (musician) => musician.id !== musicianId
    );

    setRoleMusicians(filtered);
  }

  function handleClickSelectMusician(musician: Musician) {
    if (
      getRoleMusicians()
        .map((a) => a.id)
        .includes(musician.id)
    ) {
      const filtered = getRoleMusicians().filter(
        (a) => a.id !== musician.id
      ) as Musician[];
      setRoleMusicians(filtered);
    } else {
      setRoleMusicians([...getRoleMusicians(), musician]);
    }
    setIsFocused(false);
  }

  const filteredMusicians = musicians.filter((musician) => {
    const fullName = [musician.first_name, musician.last_name].join(" ");
    return fullName.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <>
      <div className="flex flex-col gap-[8px]">
        <label htmlFor="title">
          {role.charAt(0).toUpperCase() + role.slice(1)}s
        </label>
        <div ref={inputRef} className="w-full gap-[4px] flex flex-col">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={"droppable"} direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={classNames(
                    "input-text flex-wrap flex gap-[14px] transition-default",
                    isFocused && "ring-1 ring-inset ring-fg.0"
                  )}
                >
                  {getRoleMusicians().map((musician, index) => (
                    <Draggable
                      key={musician.id}
                      draggableId={musician.id.toString()}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <span
                            key={musician.id}
                            className="px-[14px] py-[8px] rounded-default flex items-center gap-[8px] bg-bg.1"
                          >
                            <span className="flex gap-[2px]">
                              <Icon
                                path={mdiDragVertical}
                                size={1}
                                className="ml-[-10px]"
                              />
                              {musician.first_name} {musician.last_name}
                            </span>
                            <button
                              onClick={() =>
                                handleClickRemoveMusician(musician.id)
                              }
                            >
                              <Icon path={mdiClose} size={1} className="link" />
                            </button>
                          </span>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <input
                    type="text"
                    className="flex-grow bg-transparent outline-none placeholder-fg.2"
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    value={query}
                    placeholder={
                      role === "composer" && piece.composers.length === 0
                        ? "Required"
                        : ""
                    }
                    onFocus={() => setIsFocused(true)}
                  />
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="relative">
            {isFocused && (
              <div className="dropdown w-full">
                {filteredMusicians.length > 0 ? (
                  filteredMusicians.map((musician) => (
                    <button
                      key={musician.id}
                      className="dropdown-item justify-between"
                      onClick={() => handleClickSelectMusician(musician)}
                    >
                      {musician.first_name} {musician.last_name}
                      {getRoleMusicians()
                        .map((c) => c.id)
                        .includes(musician.id) && (
                        <Icon
                          path={mdiCheck}
                          size={1}
                          className="float-right"
                        />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-[14px] py-[8px] text-fg.2">
                    No results
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            className="link flex items-center gap-[8px]"
            onClick={handleClickOpenEditMusicianModal}
          >
            <Icon path={mdiPlus} size={1} />
            <span>Create musician</span>
          </button>
        </div>
      </div>
      <EditMusicianModal
        isOpen={isEditMusicianModalOpen}
        closeModal={() => setIsEditMusicianModalOpen(false)}
        onConfirm={handleConfirmCreateMusician}
      />
    </>
  );
}
