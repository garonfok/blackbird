import { ByteFile, Instrument } from "@/app/types";
import { formatPartNumbers } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { FormField } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { mdiContentSaveOutline, mdiPlus, mdiTextBoxOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema } from "../../types";
import { SortableItem } from "../SortableItem";

export function Parts(props: {
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>
  uploadedFiles: ByteFile[]
}) {
  const { pieceForm, uploadedFiles } = props;

  const [selectInstrumentOpen, setSelectInstrumentOpen] = useState(false)
  const [instruments, setInstruments] = useState<{
    [key: string]: Instrument[]
  }>();

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

  function handleSelectInstrument(field: ControllerRenderProps<z.infer<typeof pieceFormSchema>, "parts">, instrument: Instrument) {
    const newInstrument = {
      ...instrument,
      created_at: dayjs(instrument.created_at).toISOString(),
      updated_at: dayjs(instrument.updated_at).toISOString(),
    }

    field.onChange([
      ...field.value,
      {
        id: (Math.max(...field.value.map((part) => part.id), 0) + 1),
        name: instrument.name,
        instruments: [newInstrument],
      }
    ]);
    formatPartNumbers(pieceForm);

    console.log(field)
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
                              <CommandItem key={instrument.id} onSelect={() => handleSelectInstrument(field, instrument)}>
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
          <SortableContext
            id="part-list"
            items={field.value.map((part) => `p${part.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="h-full flex flex-col">
              <ScrollArea className="h-0 grow">
                <div className="flex flex-col gap-[4px]">
                  {field.value.map((part) => (
                    <SortableItem key={part.id} id={`p${part.id}`} pieceForm={pieceForm} item={part} uploadedFiles={uploadedFiles} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SortableContext>
        </div>
      )}
    />
  )
}
