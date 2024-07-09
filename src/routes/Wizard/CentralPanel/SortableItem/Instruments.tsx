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
import Fuse from "fuse.js";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { partFormSchema, pieceFormSchema } from "../../types";

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
          console.log("Adding instrument", instrument, " to part", part)
          return {
            ...p,
            instruments: [...p.instruments, instrument],
          };
        }
        return p;
      }),
    );
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
          <div>
            <Popover modal={true}>
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
                side="top"
                className="p-0 w-[404px]"
              >
                <ScrollArea>
                  <div className="max-h-36">
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
          <div className="bg-bg.0 rounded-default select-none">
            <ScrollArea>
              <div className="h-72">
                {part.instruments.map((instrument, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-[8px]"
                  >
                    <div className="text-fg.2 select-none cursor-default">
                      {instrument.name}
                    </div>
                    <Button
                      variant="link"
                      type="button"
                      className="text-xs text-fg.1"
                      onClick={() => handleClickRemoveInstrument(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
