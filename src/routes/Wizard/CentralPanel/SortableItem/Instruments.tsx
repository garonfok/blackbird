import { instrumentsGetAll } from "@/app/invokers";
import { Instrument } from "@/app/types";
import { debounce } from "@/app/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { closestCorners, DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, UniqueIdentifier, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import Fuse from "fuse.js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { partFormSchema, pieceFormSchema } from "../../types";
import { Item } from "./Item";
import { SortableItem } from "./SortableItem";

export function Instruments(props: {
  part: z.infer<typeof partFormSchema>;
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
}) {
  const { part, pieceForm } = props;

  const [categorizedInstruments, setCategorizedInstruments] = useState<{
    [key: string]: Instrument[];
  }>();
  const [filteredInstruments, setFilteredInstruments] = useState<{
    [key: string]: Instrument[];
  }>();
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [query, setQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    async function fetchInstruments() {
      const fetchedInstruments = await instrumentsGetAll();

      const groupedInstruments = fetchedInstruments.reduce(
        (acc, instrument) => {
          let category = instrument.category;

          if (!category) {
            category = "Uncategorized";
          }

          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(instrument);
          return acc;
        },
        {} as { [key: string]: Instrument[] },
      );

      setCategorizedInstruments(groupedInstruments);
      setInstruments(fetchedInstruments);
      setFilteredInstruments(groupedInstruments);
    }
    fetchInstruments();
  }, []);

  useEffect(() => {
    if (query.length === 0) {
      setFilteredInstruments(categorizedInstruments);
    } else {
      const results = fuse.search(query);
      const filtered = results.reduce(
        (acc, { item }) => {
          let category = item.category;

          if (!category) {
            category = "Uncategorized";
          }

          if (!acc[category]) {
            acc[category] = [];
          }
          acc[category].push(item);
          return acc;
        },
        {} as { [key: string]: Instrument[] },
      );

      setFilteredInstruments(filtered);
    }
  }, [query]);

  function getButtonText() {
    return `${part.instruments.length} instrument${part.instruments.length === 1 ? "" : "s"}`;
  }

  function handleSelectInstrument(instrument: Instrument) {
    if (part.instruments.map((i) => i.id).includes(instrument.id)) {
      return;
    }
    pieceForm.setValue(
      "parts",
      pieceForm.getValues("parts").map((p) => {
        if (part.id === p.id) {
          return {
            ...p,
            instruments: [...p.instruments, instrument],
          };
        }
        return p;
      }),
    );

    setInputValue("");
    setIsSearchOpen(false);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setQuery(event.target.value);
  }

  function handleClickRemoveInstrument(index: number) {
    pieceForm.setValue(
      "parts",
      pieceForm.getValues("parts").map((p) => {
        if (part.id === p.id) {
          return {
            ...p,
            instruments: part.instruments.filter(
              (_, instrumentIndex) => instrumentIndex !== index,
            ),
          };
        }
        return part;
      }),
    );
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = part.instruments.findIndex(
        (instrument) => instrument.id === active.id,
      );
      const newIndex = part.instruments.findIndex(
        (instrument) => instrument.id === over.id,
      );

      const newInstruments = arrayMove(part.instruments, oldIndex, newIndex);
      pieceForm.setValue("parts", pieceForm.getValues("parts").map((p) => {
        if (part.id === p.id) {
          return {
            ...p,
            instruments: newInstruments,
          };
        }
        return p;
      }))
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  const fuse = new Fuse(instruments, {
    keys: [
      {
        name: "name",
        weight: 4,
      },
      {
        name: "category",
        weight: 1,
      },
    ],
    threshold: 0.4,
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" type="button" className="text-xs text-fg.1">
            {getButtonText()}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="text-fg.2 text-sm select-none cursor-default">
            Managing instruments for{" "}
            <span className="text-fg.0 text-base">{part.name}</span>
          </DialogHeader>
          <div className="flex flex-col gap-[14px]">
            <SortableContext
              id="instrument-list"
              items={part.instruments}
              strategy={verticalListSortingStrategy}
            >
              <div className="bg-bg.0 rounded-default select-none">
                <ScrollArea>
                  <div className="h-72 p-[4px] flex flex-col gap-[4px]">
                    {part.instruments.map((instrument, index) => (
                      <SortableItem key={instrument.id} id={instrument.id} instrument={instrument} onRemove={() => handleClickRemoveInstrument(index)} />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </SortableContext>
            <Popover modal={true} open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <PopoverTrigger className="w-full">
                <Input
                  placeholder="Add an instrument"
                  value={inputValue}
                  onChange={(event) => {
                    handleChangeDebounced(event);
                    setInputValue(event.target.value);
                  }}
                />
              </PopoverTrigger>
              <PopoverContent
                className="p-0 w-[404px]"
              >
                <ScrollArea>
                  <div className="max-h-72">
                    {Object.keys(filteredInstruments || {}).length === 0 ? (
                      <div className="text-xs text-fg.1 p-[8px]">
                        No results
                      </div>
                    ) : Object.keys(filteredInstruments || {}).map((category) => (
                      <div key={category} className="flex flex-col p-[4px]">
                        <div className="text-xs text-fg.2 px-[8px]">
                          {category}
                        </div>
                        {filteredInstruments?.[category].map(
                          (instrument, index) => (
                            <Button
                              key={index}
                              variant="link"
                              type="button"
                              className="hover:bg-float-bg.focus justify-start"
                              onClick={() => handleSelectInstrument(instrument)}
                              disabled={part.instruments.map((i) => i.id).includes(instrument.id)}
                            >
                              {instrument.name}
                            </Button>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        </DialogContent>
      </Dialog>
      <DragOverlay>
        {activeId ? (
          <Item instrument={instruments.find(inst => inst.id === activeId)!} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
