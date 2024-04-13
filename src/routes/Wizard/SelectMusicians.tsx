import { Musician } from "@/app/types";
import { EditMusicianDialog } from "@/components/EditMusicianDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormLabel, FormMessage } from "@/components/ui/form";
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
import { useEffect, useState } from "react";

export function SelectMusicians(props: {
  role: "composers" | "arrangers" | "transcribers" | "orchestrators" | "lyricists";
  required?: boolean;
  onChange: (selectedMusicians: Musician[]) => void;
  value: Musician[];
}) {
  const { role, required, onChange, value } = props;

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [musicians, setMusicians] = useState<Musician[]>([]);

  useEffect(() => {
    fetchMusicians();
  }, [])

  async function fetchMusicians() {
    const fetchedMusicians = (await invoke("musicians_get_all")) as Musician[];

    const sorted = fetchedMusicians.sort((a, b) => {
      if (a.first_name < b.first_name) return -1;
      if (a.first_name > b.first_name) return 1;
      return 0;
    });

    setMusicians(sorted);
  }

  async function onCreateMusician(firstName: string, lastName?: string) {
    const musicianId = await invoke("musicians_add", { firstName, lastName });
    await fetchMusicians();
    const musician = (await invoke("musicians_get_by_id", {
      id: musicianId,
    })) as Musician;
    onChange([...value, musician]);
  }

  function handleDragEnd(result: DropResult) {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const cloned = [...value];
    const file = cloned[source.index];
    cloned.splice(source.index, 1);
    cloned.splice(destination.index, 0, file);

    onChange(cloned);
  }

  function handleClickRemoveMusician(musicianId: number) {
    const filtered = value.filter(
      (musician) => musician.id !== musicianId
    );

    onChange(filtered);
  }

  function handleClickSelectMusician(musician: Musician) {
    if (
      value
        .map((m) => m.id)
        .includes(musician.id)
    ) {
      const filtered = value.filter(
        (a) => a.id !== musician.id
      ) as Musician[];
      onChange(filtered);
    } else {
      onChange([...value, musician]);
    }
  }
  return (
    <>
      <div className="flex flex-col gap-[4px]">
        <span className="flex gap-[8px] items-center">
          <FormLabel htmlFor={role}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </FormLabel>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button type="button" className="flex items-center gap-[4px] p-1" variant='main'>
                <Icon path={mdiPlus} size={0.667} />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <EditMusicianDialog onConfirm={onCreateMusician} onClose={setCreateOpen} />
            </DialogContent>
          </Dialog>
        </span>
        <FormControl>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={popoverOpen}
                onClick={() => setPopoverOpen(!open)}
                className={cn("w-full justify-between border-divider.default bg-bg.2")}
              >
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={"droppable"} direction="horizontal">
                    {droppableProvided => (
                      <div
                        ref={droppableProvided.innerRef}
                        {...droppableProvided.droppableProps}
                        className="flex gap-1 flex-wrap">
                        {value.length > 0 ? value.map((musician, index) => (
                          <Draggable
                            key={musician.id}
                            draggableId={musician.id.toString()}
                            index={index}
                          >
                            {draggableProvided => (
                              <div
                                ref={draggableProvided.innerRef}
                                {...draggableProvided.draggableProps}
                                {...draggableProvided.dragHandleProps}>
                                <Badge
                                  className="gap-2"
                                >
                                  <Icon
                                    path={mdiDragVertical}
                                    size={0.667}
                                    className="ml-[-4px]"
                                  />
                                  {musician.first_name} {musician.last_name}
                                  <button
                                    className="ml-1 ring-offset-fg.0 rounded-full outline-none focus:ring-2 focus:ring-fg.0"
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
                                    onSelect={() => handleClickRemoveMusician(musician.id)}
                                  >
                                    <Icon path={mdiClose} size={0.667} className="text-fg.2 hover:text-fg.0" />
                                  </button>
                                </Badge>
                              </div>
                            )}
                          </Draggable>
                        )) : <span className="text-fg.2">{required && "Required"}</span>}
                        {droppableProvided.placeholder}
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
                            className="text-fg.1"
                          >
                            <Icon
                              path={mdiCheck}
                              size={1}
                              className={cn(
                                "mr-2",
                                value.map(m => m.id).includes(musician.id) ?
                                  "opacity-100" : "opacity-0"
                              )}
                            />
                            <span>{musician.first_name} {musician.last_name}</span>
                            {/* Workaround to ensure hover function works for duplicate */}
                            <span className="invisible">{musician.id}</span>
                          </CommandItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormControl>
        <FormMessage />
      </div >
    </>
  );
}
