import { Instrument } from "@/app/types";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";

interface GroupedInstruments {
  [key: string]: Instrument[];
}

export function SelectInstrument(props: {
  onInstrumentSelect: (instrumentId: number) => void;
}) {
  const { onInstrumentSelect } = props

  const [open, setOpen] = useState(false)
  const [groupedInstruments, setGroupedInstruments] = useState<GroupedInstruments>({});

  useEffect(() => {
    fetchInstruments();
  }, [])

  async function fetchInstruments() {
    const instruments = (await invoke("instruments_get_all")) as Instrument[];
    const groupedInstruments = instruments.reduce((acc, instrument) => {
      if (instrument.category === undefined) {
        acc["Other"] = [...(acc["Other"] || []), instrument];
        return acc;
      } else {
        acc[instrument.category] = [
          ...(acc[instrument.category] || []),
          instrument,
        ];
        return acc;
      }
    }, {} as GroupedInstruments);
    setGroupedInstruments(groupedInstruments);
  }

  function handleSelect(instrumentId: number) {
    onInstrumentSelect(instrumentId);
    setOpen(false);
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1 hover:text-fg.0 transition-default">
        <Icon path={mdiPlus} size={1} />
        <span>Create part</span>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for an instrument" />
        <ScrollArea>
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.keys(groupedInstruments).map((category, index) => (
              <>
                <CommandGroup heading={category} key={index}>
                  {groupedInstruments[category].map(instrument => (
                    <CommandItem key={instrument.id} className="p-0" onSelect={() => handleSelect(instrument.id)}>
                      {instrument.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
                {index + 1 !== Object.keys(groupedInstruments).length && <CommandSeparator />}
              </>
            ))}
          </CommandList>
        </ScrollArea>
      </CommandDialog>
    </>
  )
}
