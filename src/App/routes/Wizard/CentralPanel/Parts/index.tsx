import { Button } from "@/components/ui/button";
import { Checkbox, CheckedState } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FormField } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { instrumentsGetAll } from "@/invokers/db/instruments";
import { ByteFile, Instrument, pieceFormSchema } from "@/types";
import { formatPartNumbers } from "@/utils/pieces";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  mdiContentSaveOutline,
  mdiDotsHorizontal,
  mdiPlus,
  mdiTextBoxOutline,
} from "@mdi/js";
import Icon from "@mdi/react";
import { MouseEvent, useEffect, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  clearFile,
  duplicate,
  moveAbove,
  moveBelow,
  removeItem,
} from "../menuUtils";
import { SortableItem } from "../SortableItem";

export function Parts(props: {
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
  uploadedFiles: ByteFile[];
}) {
  const { pieceForm, uploadedFiles } = props;

  const [selectInstrumentOpen, setSelectInstrumentOpen] = useState(false);
  const [instruments, setInstruments] = useState<{
    [key: string]: Instrument[];
  }>();
  const [anchor, setAnchor] = useState(0);
  const [checkedMap, setCheckedMap] = useState(new Map<string, CheckedState>());

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

      setInstruments(groupedInstruments);
    }

    function resetCheckboxStates() {
      const newCheckedMap = new Map<string, CheckedState>();
      pieceForm.getValues("parts").forEach((part) => {
        newCheckedMap.set(`p${part.id}`, false);
      });
      setCheckedMap(newCheckedMap);
    }

    fetchInstruments();
    resetCheckboxStates();
  }, []);

  function handleSelectInstrument(
    field: ControllerRenderProps<z.infer<typeof pieceFormSchema>, "parts">,
    instrument: Instrument,
  ) {
    const newInstrument = {
      ...instrument,
      created_at: instrument.created_at,
      updated_at: instrument.updated_at,
    };

    const id = Math.max(...field.value.map((part) => part.id), 0) + 1;

    field.onChange([
      ...field.value,
      {
        id,
        name: instrument.name,
        instruments: [newInstrument],
      },
    ]);

    setCheckedMap(new Map(checkedMap.set(`p${id}`, false)));

    formatPartNumbers(pieceForm);
  }

  function handleClickCheck(
    event: MouseEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.shiftKey) {
      let adjustedAnchor = anchor;

      while (pieceForm.getValues("parts")[adjustedAnchor] === undefined) {
        adjustedAnchor--;
      }

      const min = Math.min(adjustedAnchor, index);
      let max = Math.max(adjustedAnchor, index);
      const selected = pieceForm.getValues("parts")[index]!;
      const selectedChecked = checkedMap.get(`p${selected.id}`);

      for (let i = min; i <= max; i++) {
        const part = pieceForm.getValues("parts")[i]!;
        checkedMap.set(`p${part.id}`, !selectedChecked);
      }
    } else {
      const part = pieceForm.getValues("parts")[index]!;
      checkedMap.set(`p${part.id}`, !checkedMap.get(`p${part.id}`));
    }
    setCheckedMap(new Map(checkedMap));
    setAnchor(index);
  }

  function getHeaderCheckedState() {
    if (checkedMap.size === 0) {
      return false;
    }

    if (Array.from(checkedMap.values()).every((value) => value)) {
      return true;
    }
    if (Array.from(checkedMap.values()).every((value) => !value)) {
      return false;
    }
    return "indeterminate";
  }

  function handleCheckHeader() {
    const newCheckedMap = new Map<string, CheckedState>();

    const values = Array.from(checkedMap.values());

    if (values.every((value) => !value)) {
      for (const key of checkedMap.keys()) {
        newCheckedMap.set(key, true);
      }
    } else {
      for (const key of checkedMap.keys()) {
        newCheckedMap.set(key, false);
      }
    }

    setCheckedMap(newCheckedMap);
  }

  function handleClickClearFile() {
    for (const [key, value] of checkedMap.entries()) {
      if (value) {
        clearFile(parseInt(key.slice(1)), "parts", pieceForm);
      }
    }
  }

  function handleClickDuplicate() {
    for (const [key, value] of checkedMap.entries()) {
      if (value) {
        duplicate(parseInt(key.slice(1)), "parts", pieceForm);
      }
    }
    formatPartNumbers(pieceForm);
  }

  function handleClickMoveAbove() {
    const selectedIds = Array.from(checkedMap.entries())
      .filter((entry) => entry[1])
      .map((entry) => parseInt(entry[0].slice(1)));
    moveAbove(selectedIds, "parts", pieceForm);
  }

  function handleClickMoveBelow() {
    const selectedIds = Array.from(checkedMap.entries())
      .filter((entry) => entry[1])
      .map((entry) => parseInt(entry[0].slice(1)));
    moveBelow(selectedIds, "parts", pieceForm);
  }

  function handleClickRemoveItem() {
    for (const [key, value] of checkedMap.entries()) {
      if (value) {
        removeItem(
          parseInt(key.slice(1)),
          "parts",
          pieceForm,
          checkedMap,
          setCheckedMap,
        );
      }
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
            {field.value.length > 0 && (
              <Button type="button" variant="main">
                <Icon path={mdiContentSaveOutline} size={2 / 3} />
                Save as template
              </Button>
            )}
          </span>
          <Separator />
          <div className="flex items-center px-[10px] gap-[4px]">
            <Popover
              open={selectInstrumentOpen}
              onOpenChange={setSelectInstrumentOpen}
            >
              <PopoverTrigger asChild>
                <Button type="button" variant="main" className="p-1">
                  <Icon path={mdiPlus} size={2 / 3} />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Command>
                  <CommandInput placeholder="Search for an instrument" />
                  <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <ScrollArea>
                      <div className="max-h-60">
                        {instruments &&
                          Object.keys(instruments).map((category) => (
                            <CommandGroup key={category} heading={category}>
                              {instruments[category].map((instrument) => (
                                <CommandItem
                                  key={instrument.id}
                                  onSelect={() =>
                                    handleSelectInstrument(field, instrument)
                                  }
                                >
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
            <Checkbox
              checked={getHeaderCheckedState()}
              onCheckedChange={handleCheckHeader}
            />
            {Array.from(checkedMap.values()).filter((val) => val).length >
              0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="link" className="p-0" type="button">
                      <Icon
                        path={mdiDotsHorizontal}
                        size={1}
                        className="shrink-0"
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={handleClickClearFile}>
                      Clear file
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleClickMoveAbove}>
                      Move above
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleClickMoveBelow}>
                      Move below
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleClickDuplicate}>
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleClickRemoveItem}>
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>
          <SortableContext
            id="part-list"
            items={field.value.map((part) => `p${part.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="h-full flex flex-col">
              <ScrollArea className="h-0 grow">
                <div className="flex flex-col gap-[4px]">
                  {field.value.map((part, index) => (
                    <SortableItem
                      key={part.id}
                      id={`p${part.id}`}
                      pieceForm={pieceForm}
                      item={part}
                      uploadedFiles={uploadedFiles}
                      checkedMap={checkedMap}
                      setCheckedMap={setCheckedMap}
                      handleClickCheck={(event) =>
                        handleClickCheck(event, index)
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SortableContext>
        </div>
      )}
    />
  );
}
