import { ByteFile } from "@/app/types";
import { cn, formatPartNumbers } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckedState } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mdiCheck, mdiChevronDown, mdiClose, mdiDotsHorizontal, mdiDragVertical, mdiFile } from "@mdi/js";
import Icon from "@mdi/react";
import { Dispatch, MouseEventHandler, SetStateAction, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { partFormSchema, pieceFormSchema, scoreFormSchema } from "../types";
import { clearFile, duplicate, moveAbove, moveBelow, removeItem } from "./menuUtils";

export function SortableItem(props: {
  id: UniqueIdentifier;
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
  item: z.infer<typeof partFormSchema> | z.infer<typeof scoreFormSchema>;
  uploadedFiles: ByteFile[];
  checkedMap: Map<string, CheckedState>;
  setCheckedMap: Dispatch<SetStateAction<Map<string, CheckedState>>>
  handleClickCheck: MouseEventHandler<HTMLButtonElement>
}) {
  const { id, pieceForm, item, uploadedFiles, checkedMap, setCheckedMap, handleClickCheck } = props;

  const [open, setOpen] = useState(false);

  const type = item.hasOwnProperty("instruments") ? "parts" : "scores";

  const checked = checkedMap.get(id.toString())!

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
    active,
    isOver,
  } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleClickRemoveItem() {
    removeItem(parseInt(id.toString().slice(1)), type, pieceForm, checkedMap, setCheckedMap);
    formatPartNumbers(pieceForm);
  }

  function handleSelectFile(file: ByteFile) {
    if (type === "parts") {
      pieceForm.setValue(
        type,
        pieceForm.getValues(type).map((part) => {
          if (part.id.toString() === id.toString().slice(1)) {
            return {
              ...part,
              file,
            };
          }
          return part;
        }),
      );
    } else if (type === "scores") {
      pieceForm.setValue(
        type,
        pieceForm.getValues(type).map((score) => {
          if (score.id.toString() === id.toString().slice(1)) {
            return {
              ...score,
              file,
            };
          }
          return score;
        }),
      );
    }

    setOpen(false)
  }

  function handleClickRename() {

  }

  function handleClearFile() {
    if (type === "parts") {
      pieceForm.setValue(
        type,
        pieceForm.getValues(type).map((part) => {
          if (part.id.toString() === id.toString().slice(1)) {
            return {
              ...part,
              file: undefined,
            };
          }
          return part;
        }),
      );
    } else if (type === "scores") {
      pieceForm.setValue(
        type,
        pieceForm.getValues(type).map((score) => {
          if (score.id.toString() === id.toString().slice(1)) {
            return {
              ...score,
              file: undefined,
            };
          }
          return score;
        }),
      );
    }
    setOpen(false)
  }

  function handleClickClearFile() {
    clearFile(parseInt(id.toString().slice(1)), type, pieceForm);
  }


  function handleClickDuplicate() {
    duplicate(parseInt(id.toString().slice(1)), type, pieceForm);
    if (type === "parts") {
      formatPartNumbers(pieceForm);
    }
  }

  function handleClickMoveAbove() {
    moveAbove([parseInt(id.toString().slice(1))], type, pieceForm);
  }

  function handleClickMoveBelow() {
    moveBelow([parseInt(id.toString().slice(1))], type, pieceForm);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex item-center gap-[4px] px-[8px] py-[2px] border border-divider.default rounded-default bg-main-bg.default"
    >
      <Button
        type="button"
        variant="main"
        className="p-[4px] h-fit self-center"
        {...attributes}
        {...listeners}
      >
        <Icon
          path={mdiDragVertical}
          size={2 / 3}
          className="shrink-0 self-center"
        />
      </Button>
      <div
        className="flex items-center pr-[8px]"
      >
        <Checkbox id={item.id.toString()} checked={checked} onClick={handleClickCheck} />
      </div>
      <span className="gap-[8px] flex grow w-36 items-center">
        <label htmlFor={item.id.toString()} className="w-full truncate">
          {item.name}
        </label>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="link" className="p-0" type="button">
                <Icon path={mdiDotsHorizontal} size={1} className="shrink-0" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleClickRename}>
                Rename
              </DropdownMenuItem>
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
        </div>
      </span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("max-w-64 w-full self-center h-fit px-[4px] py-[2px] justify-between border-divider.default bg-bg.2", (isOver && active?.id.toString().startsWith("f")) && "border-divider.focus")}
          >
            <div className="flex gap-1 flex-wrap w-full">
              {item.file ? (
                <span className="flex w-full items-center relative">
                  <span className="absolute w-full truncate text-start">
                    {item.file.name}
                  </span>
                </span>
              ) : (<span className="text-fg.2">Select file</span>)}
            </div>
            <Icon path={mdiChevronDown} size={2 / 3} className={cn("shrink-0 opacity-50 rotate-0 transition-transform", open && "rotate-180")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0">
          <Command>
            <CommandInput placeholder="Search for a file" />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea>
                  <div className="max-h-60">
                    <CommandItem
                      onSelect={handleClearFile}
                      className="text-fg.2">
                      <Icon
                        path={mdiCheck}
                        size={2 / 3}
                        className="mr-2 shrink-0 opacity-0"
                      />
                      None
                    </CommandItem>
                    {uploadedFiles.map((file) => (
                      <CommandItem
                        key={file.id}
                        onSelect={() => handleSelectFile(file)}
                        className="text-fg.1"
                      >
                        <Icon
                          path={mdiCheck}
                          size={2 / 3}
                          className={cn(
                            "mr-2 shrink-0",
                            item.file?.id === file.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="flex gap-[8px] items-center w-full">
                          <Icon
                            path={mdiFile}
                            size={2 / 3}
                            className="shrink-0"
                          />
                          <div className="relative flex w-full items-center">
                            <span className="absolute truncate w-full">{file.name}</span>
                          </div>
                        </span>
                      </CommandItem>
                    ))}
                  </div>
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button
        type="button"
        variant="main"
        className="p-1 h-fit self-center"
        onClick={handleClickRemoveItem}
      >
        <Icon path={mdiClose} size={2 / 3} className="shrink-0 self-center" />
      </Button>
    </div>
  );
}
