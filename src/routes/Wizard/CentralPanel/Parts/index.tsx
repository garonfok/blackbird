import { Instrument } from "@/app/types";
import { formatPartNumbers } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FormField } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { mdiContentSaveOutline, mdiPlus, mdiTextBoxOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { partFormSchema, pieceFormSchema } from "../../types";
import { SortableItem } from "../SortableItem";

export function Parts(props: { pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>> }) {
  const { pieceForm } = props;

  const [selectInstrumentOpen, setSelectInstrumentOpen] = useState(false)
  const [instruments, setInstruments] = useState<{
    [key: string]: Instrument[]
  }>();
  const [activeItem, setActiveItem] = useState<null | z.infer<typeof partFormSchema>>(null)

  useEffect(() => {
    async function fetchInstruments() {
      const fetchedInstruments = (await invoke("instruments_get_all")) as Instrument[];

      const groupedInstruments = fetchedInstruments.reduce((acc, instrument) => {
        let category = instrument.category;

        if (!category) {
          category = "Uncategorized";
        }

        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(instrument);
        return acc;
      }, {} as { [key: string]: Instrument[] });

      setInstruments(groupedInstruments);
    }

    fetchInstruments();
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleSelectInstrument(instrument: Instrument) {
    pieceForm.setValue("parts", [
      ...pieceForm.getValues("parts"),
      {
        id: (Math.max(...pieceForm.getValues("parts").map((part) => part.id), 0) + 1),
        name: instrument.name,
        instruments: [instrument],
      }
    ]);

    formatPartNumbers(pieceForm);
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const part = pieceForm.getValues("parts").find((part) => part.id === active.id);
    setActiveItem(part!);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = pieceForm.getValues("parts").findIndex((part) => part.id === active.id);
      const newIndex = pieceForm.getValues("parts").findIndex((part) => part.id === over?.id);
      const newParts = arrayMove(pieceForm.getValues("parts"), oldIndex, newIndex);
      pieceForm.setValue("parts", newParts);
    }

    formatPartNumbers(pieceForm);
  }

  return (
    <FormField
      control={pieceForm.control}
      name="parts"
      render={({ field }) => (
        <div className="flex flex-col gap-[8px] h-full">
          <span className="flex gap-[14px] items-center">
            <Button type="button" variant="main">
              <Icon path={mdiTextBoxOutline} size={2 / 3} />
              Load from template
            </Button>
            <Popover open={selectInstrumentOpen} onOpenChange={setSelectInstrumentOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant='main'>
                  <Icon path={mdiPlus} size={2 / 3} />
                  Add part
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <Command>
                  <CommandInput placeholder="Search for an instrument" />
                  <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <ScrollArea>
                      <div className="max-h-60">
                        {instruments && Object.keys(instruments).map((category) => (
                          <CommandGroup key={category} heading={category}>
                            {instruments[category].map((instrument) => (
                              <CommandItem key={instrument.id} onSelect={() => handleSelectInstrument(instrument)}>
                                {instrument.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        ))}
                      </div>
                    </ScrollArea>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {field.value.length > 0 && (
              <Button type="button" variant="main">
                <Icon path={mdiContentSaveOutline} size={2 / 3} />
                Save as template
              </Button>
            )}
          </span>
          <Separator />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              id="score-list"
              items={field.value}
              strategy={verticalListSortingStrategy}
            >
              <div className="h-full flex flex-col">
                <ScrollArea className="h-0 grow">
                  <div className="flex flex-col gap-[4px]">
                    {field.value.map((part) => (
                      <SortableItem key={part.id} id={part.id} pieceForm={pieceForm} type="parts" >
                        <span>{part.name}</span>
                      </SortableItem>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </SortableContext>
            <DragOverlay>
              {activeItem &&
                (<SortableItem id={activeItem.id} pieceForm={pieceForm} type="scores" >
                  <span>{activeItem.name}</span>
                </SortableItem>)
              }
            </DragOverlay>
          </DndContext>
        </div>
      )}
    />
  )
}
