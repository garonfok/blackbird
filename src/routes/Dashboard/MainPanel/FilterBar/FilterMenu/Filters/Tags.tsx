import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { tagsGetAll } from "@/app/invokers";
import { Tag } from "@/app/types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pushTag, removeTag } from "@/routes/Dashboard/reducers/filterSlice";
import { useEffect, useState } from "react";

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const filter = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    const tags = await tagsGetAll();
    setTags(tags);
  }

  async function handleChange(checked: boolean | "indeterminate", tag: Tag) {
    if (checked) {
      dispatch(pushTag(tag));
    } else {
      dispatch(removeTag(tag.id));
    }
  }

  return (
    <Command className="flex flex-col gap-[4px]">
      <CommandInput placeholder="Tags" />
      <CommandList className="overflow-hidden">
        <CommandEmpty>No tags found.</CommandEmpty>
        <CommandGroup className="p-0">
          <ScrollArea>
            <div className="max-h-[300px]">
              {tags.map((tag) => (
                <CommandItem key={tag.id} asChild>
                  <label
                    htmlFor={tag.id.toString()}
                    className="flex items-center gap-[8px] group"
                  >
                    <Checkbox
                      id={tag.id.toString()}
                      onCheckedChange={(checked) => handleChange(checked, tag)}
                      checked={filter.tags.some((t) => t.id === tag.id)}
                    />
                    <span className="text-fg.1">{tag.name}</span>
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
