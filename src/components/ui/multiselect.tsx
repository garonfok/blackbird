
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { mdiCheck, mdiChevronDown, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { Dispatch, SetStateAction, useState } from "react";


export type OptionType = {
  label: string;
  value: string | number;
}

interface MultiSelectProps {
  options: OptionType[];
  selected: (string | number)[];
  onChange: Dispatch<SetStateAction<(string | number)[]>>;
  className?: string;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
}

const MultiSelect = ({ options, selected, onChange, className, selectPlaceholder, searchPlaceholder, ...props }: MultiSelectProps) => {

  const [open, setOpen] = useState(false)

  const handleUnselect = (item: string | number) => {
    onChange(selected.filter((i) => i !== item))
  }

  return (
    <Popover open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between border-fg.2 bg-bg.2", selected.length > 1 ? "h-full" : "h-10")}
          onClick={() => setOpen(!open)}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.length > 0 ? selected.map((item) => (
              <Badge
                key={item}
                className="mr-1 mb-1"
              >
                {options.find((option) => option.value === item)?.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-fg.0 focus:ring-offset-2"
                  onSelect={() => handleUnselect(item)}
                >
                  <Icon path={mdiClose} size={0.75} className="text-fg.2 hover:text-fg.0" />
                </button>
              </Badge>
            )) : <span className="text-fg.1">{selectPlaceholder ?? "Select options"}</span>}
          </div>
          <Icon path={mdiChevronDown} size={1} className={cn("shrink-0 opacity-50 rotate-0 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command className={className}>
          <CommandInput placeholder={searchPlaceholder ?? "Search for an option"} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea>
                <div className="max-h-60">
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      onSelect={() => {
                        onChange(
                          selected.includes(option.value)
                            ? selected.filter((item) => item !== option.value)
                            : [...selected, option.value]
                        )
                        setOpen(true)
                      }}
                      className="text-fg.1"
                    >
                      <Icon
                        path={mdiCheck}
                        size={1}
                        className={cn(
                          "mr-2",
                          selected.includes(option.value) ?
                            "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </div>
              </ScrollArea>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelect };

