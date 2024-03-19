
import { Tag } from "@/app/types";
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
import { mdiCheck, mdiChevronDown, mdiClose, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import { useState } from "react";

export function SelectTags(props: { allTags: Tag[], selected: Tag[], onChange: (tags: Tag[]) => void }) {

  const { allTags, selected, onChange } = props;

  const [open, setOpen] = useState(false)

  function handleUnselect(tag: Tag) {
    onChange(selected.filter((t) => t !== tag))
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
            {selected.length > 0 ? selected.map((tag) => (
              <Badge
                key={tag.id}
                className="mr-1 mb-1"
              >
                <Icon path={mdiTag} size={0.75} color={tag.color} className="mr-1" />
                {tag.name}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-fg.0 focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUnselect(tag);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(tag)}
                >
                  <Icon path={mdiClose} size={0.75} className="text-fg.2 hover:text-fg.0" />
                </button>
              </Badge>
            )) : <span className="text-fg.1">Select tags</span>}
          </div>
          <Icon path={mdiChevronDown} size={1} className={cn("shrink-0 opacity-50 rotate-0 transition-transform", open && "rotate-180")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search for a tag" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              <ScrollArea>
                <div className="max-h-60">
                  {allTags.map((tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => {
                        onChange(
                          selected.includes(tag)
                            ? selected.filter((t) => t !== tag)
                            : [...selected, tag]
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
                          selected.includes(tag) ?
                            "opacity-100" : "opacity-0"
                        )}
                      />
                      <Icon path={mdiTag} size={0.75} color={tag.color} className="mr-1" />
                      {tag.name}
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
