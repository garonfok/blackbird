import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { musiciansGetAll } from "@/app/invokers";
import { Musician } from "@/app/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pushRole, removeRole } from "@/routes/Dashboard/reducers/filterSlice";
import { mdiCheckBold } from "@mdi/js";
import Icon from "@mdi/react";
import { ChangeEvent, useEffect, useState } from "react";

export function Transcribers() {
  const [musicians, setMusicians] = useState<Musician[]>([]);

  const filter = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchMusicians();
  }, []);

  async function fetchMusicians() {
    const musicians = await musiciansGetAll();
    setMusicians(musicians);
  }

  async function handleChange(
    event: ChangeEvent<HTMLInputElement>,
    m: Musician,
  ) {
    if (event.target.checked) {
      dispatch(
        pushRole({
          role: "transcribers",
          musician: m,
        }),
      );
    } else {
      dispatch(
        removeRole({
          role: "transcribers",
          musician: m,
        }),
      );
    }
  }

  return (
    <Command className="flex flex-col gap-[4px]">
      <CommandInput placeholder="Transcribers" />
      <CommandList className="overflow-hidden">
        <CommandEmpty>No transcribers found.</CommandEmpty>
      </CommandList>
      <CommandGroup className="p-0">
        <ScrollArea>
          <div className="max-h-[300px]">
            {musicians.map((musician) => (
              <CommandItem key={musician.id} asChild>
                <label
                  htmlFor={musician.id.toString()}
                  className="flex items-center gap-[8px] group"
                >
                  <input
                    onChange={(event) => handleChange(event, musician)}
                    id={musician.id.toString()}
                    checked={filter.transcribers.some(
                      (i) => i.id === musician.id,
                    )}
                    type="checkbox"
                    className="relative peer appearance-none w-4 h-4 border border-fg.2 rounded-default group-hover:border-fg.1 invisible checked:visible group-hover:visible checked:border-fg.1 checked:bg-fg.1"
                  />
                  <Icon
                    path={mdiCheckBold}
                    size={2 / 3}
                    className="absolute w-3 h-3 hidden peer-checked:block text-float-bg.default pointer-events-none"
                  />
                  <span>
                    {[musician.first_name, musician.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </label>
              </CommandItem>
            ))}
          </div>
        </ScrollArea>
      </CommandGroup>
    </Command>
  );
}
