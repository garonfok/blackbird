import { ByteFile } from "@/app/types";
import { formatPartNumbers } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/app/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { mdiCheck, mdiChevronDown, mdiClose, mdiDragVertical, mdiFile } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { partFormSchema, pieceFormSchema, scoreFormSchema } from "../types";

export function SortableItem(props: {
  id: UniqueIdentifier;
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
  item: z.infer<typeof partFormSchema> | z.infer<typeof scoreFormSchema>;
  uploadedFiles: ByteFile[];
}) {
  const { id, pieceForm, item, uploadedFiles } = props;

  const [open, setOpen] = useState(false);

  const type = item.hasOwnProperty("instruments") ? "parts" : "scores";

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
    pieceForm.setValue(
      type,
      pieceForm.getValues(type).filter((item) => item.id.toString() !== id.toString().slice(1)),
    );
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex item-center gap-[4px] p-[4px] border border-divider.default rounded-default bg-main-bg.default"
    >
      <Button
        type="button"
        variant="main"
        className="p-1 h-fit self-center"
        {...attributes}
        {...listeners}
      >
        <Icon
          path={mdiDragVertical}
          size={0.667}
          className="shrink-0 self-center"
        />
      </Button>
      <span className="grow self-center">{item.name}</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-64 justify-between border-divider.default bg-bg.2", (isOver && active?.id.toString().startsWith("f")) && "border-divider.focus")}
          >
            <div className="flex gap-1 flex-wrap truncate">
              {item.file ? item.file.name : (<span className="text-fg.2">Select file</span>)}
            </div>
            <Icon path={mdiChevronDown} size={1} className={cn("shrink-0 opacity-50 rotate-0 transition-transform", open && "rotate-180")} />
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
                        size={1}
                        className={cn(
                          "mr-2 opacity-0",
                        )}
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
                          size={0.667}
                          className={cn(
                            "mr-2 shrink-0",
                            item.file?.id === file.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="flex gap-[8px] items-center">
                          <Icon
                            path={mdiFile}
                            size={0.667}
                            className="shrink-0"
                          />
                          {file.name}
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
        <Icon path={mdiClose} size={0.667} className="shrink-0 self-center" />
      </Button>
    </div>
  );
}
