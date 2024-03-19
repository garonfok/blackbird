import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Musician } from "@/app/types";
import { EditMusicianDialog } from "@/components/EditMusicianDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from "@hello-pangea/dnd";
import { mdiCheck, mdiChevronDown, mdiClose, mdiDragVertical, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { PopoverTrigger } from "@radix-ui/react-popover";
import { invoke } from "@tauri-apps/api";
import { useState } from "react";
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

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const piece = useAppSelector((state) => state.piece.present);

  const dispatch = useAppDispatch();
  const musicians = useAppSelector((state) => state.musicians);

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

  async function onCreateMusician(firstName: string, lastName?: string) {
    const musicianId = await invoke("musicians_add", { firstName, lastName });
    await fetchMusicians();
    const musician = (await invoke("musicians_get_by_id", {
      id: musicianId,
    })) as Musician;
    setRoleMusicians([...getRoleMusicians(), musician]);
  }

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
  }
  return (
    <>
      <div className="flex flex-col gap-[8px]">
        <Label htmlFor={role}>
          {role.charAt(0).toUpperCase() + role.slice(1)}s
        </Label>
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={popoverOpen}
              onClick={() => setPopoverOpen(!open)}
              className={cn("w-full justify-between border-fg.2 bg-bg.2", getRoleMusicians().length > 1 ? "h-full" : "h-10")}
            >
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={"droppable"} direction="horizontal">
                  {provided => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex gap-1 flex-wrap">
                      {getRoleMusicians().length > 0 ? getRoleMusicians().map((musician, index) => (
                        <Draggable
                          key={musician.id}
                          draggableId={musician.id.toString()}
                          index={index}
                        >
                          {provided => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}>
                              <Badge
                                className="mr-1 mb-1"
                              >
                                <Icon
                                  path={mdiDragVertical}
                                  size={1}
                                  className="ml-[-10px]"
                                />
                                {musician.first_name} {musician.last_name}
                                <button
                                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-fg.0 focus:ring-offset-2"
                                  onKeyDown={e => {
                                    if (e.key === "Enter") {
                                      handleClickRemoveMusician(musician.id);
                                    }
                                  }}
                                  onMouseDown={e => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                  onClick={() => handleClickRemoveMusician(musician.id)}
                                >
                                  <Icon path={mdiClose} size={0.75} className="text-fg.2 hover:text-fg.0" />
                                </button>
                              </Badge>
                            </div>
                          )}
                        </Draggable>
                      )) : <span className="text-fg.2">Required</span>}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <Icon path={mdiChevronDown} size={1} className={cn("shrink-0 opacity-50 rotate-0 transition-transform", popoverOpen && "rotate-180")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Search for a musician" />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <ScrollArea>
                    <div className="max-h-60">
                      {musicians.map((musician) => (
                        <CommandItem
                          key={musician.id}
                          onSelect={() => {
                            handleClickSelectMusician(musician);
                            setPopoverOpen(true);
                          }}
                        >
                          <Icon
                            path={mdiCheck}
                            size={1}
                            className={cn(
                              "mr-2",
                              getRoleMusicians().includes(musician) ?
                                "opacity-100" : "opacity-0"
                            )}
                          />
                          {musician.first_name} {musician.last_name}
                        </CommandItem>
                      ))}
                    </div>
                  </ScrollArea>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className="flex items-center gap-[8px] hover:text-fg.0 transitio-default">
            <Icon path={mdiPlus} size={1} />
            <span>Create musician</span>
          </DialogTrigger>
          <DialogContent>
            <EditMusicianDialog onConfirm={onCreateMusician} onClose={setCreateOpen} />
          </DialogContent>
        </Dialog>
      </div >
    </>
  );
}
