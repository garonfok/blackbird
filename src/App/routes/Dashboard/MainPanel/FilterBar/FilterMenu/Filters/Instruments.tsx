import {
  pushInstrument,
  removeInstrument,
} from "@/App/routes/Dashboard/reducers/filterSlice";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { instrumentsGetAll } from "@/invokers/db/instruments";
import { Instrument } from "@/types";
import { mdiCheckBold } from "@mdi/js";
import Icon from "@mdi/react";
import { ChangeEvent, useEffect, useState } from "react";

export function Instruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);

  const filter = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchInstruments();
  }, []);

  async function fetchInstruments() {
    const instruments = await instrumentsGetAll();
    setInstruments(instruments);
  }

  async function handleChange(
    event: ChangeEvent<HTMLInputElement>,
    instr: Instrument,
  ) {
    if (event.target.checked) {
      dispatch(pushInstrument(instr));
    } else {
      dispatch(removeInstrument(instr.id));
    }
  }

  return (
    <Command className="flex flex-col gap-[4px]">
      <CommandInput placeholder="Instruments" />
      <CommandList className="overflow-hidden">
        <CommandEmpty>No instruments found.</CommandEmpty>
        <CommandGroup className="p-0">
          <ScrollArea>
            <div className="max-h-[300px]">
              {instruments.map((instrument) => (
                <CommandItem key={instrument.id} asChild>
                  <label
                    htmlFor={instrument.id.toString()}
                    className="flex items-center gap-[8px] group"
                  >
                    <input
                      onChange={(event) => handleChange(event, instrument)}
                      id={instrument.id.toString()}
                      checked={filter.instruments.some(
                        (i) => i.id === instrument.id,
                      )}
                      type="checkbox"
                      className="relative peer appearance-none w-4 h-4 border border-fg.2 rounded-default group-hover:border-fg.1 invisible checked:visible group-hover:visible checked:border-fg.1 checked:bg-fg.1"
                    />
                    <Icon
                      path={mdiCheckBold}
                      size={2 / 3}
                      className="absolute w-3 h-3 hidden peer-checked:block text-float-bg.default pointer-events-none"
                    />
                    <span>{instrument.name}</span>
                  </label>
                </CommandItem>
              ))}
            </div>
          </ScrollArea>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
