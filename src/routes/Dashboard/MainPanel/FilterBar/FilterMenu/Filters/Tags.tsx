import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { tagsGetAll } from "@/app/invokers";
import { Tag } from "@/app/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pushTag, removeTag } from "@/routes/Dashboard/reducers/filterSlice";
import { mdiCheckBold } from "@mdi/js";
import Icon from "@mdi/react";
import { ChangeEvent, useEffect, useState } from "react";

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);

  const filter = useAppSelector(state => state.filter);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchTags();
  }, [])

  async function fetchTags() {
    const tags = await tagsGetAll();
    setTags(tags);
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>, tag: Tag) {
    if (event.target.checked) {
      dispatch(pushTag(tag));
    } else {
      dispatch(removeTag(tag.id));
    }
  }

  return (
    <Command className="flex flex-col gap-[4px]">
      <CommandInput placeholder="Tags" />
      <CommandList className="overflow-hidden">
        <CommandEmpty>
          No tags found.
        </CommandEmpty>
        <CommandGroup className="p-0">
          <ScrollArea>
            <div className="max-h-[300px]">
              {tags.map(tag => (
                <CommandItem key={tag.id} asChild>
                  <label htmlFor={tag.id.toString()} className="flex items-center gap-[8px] group">
                    <input
                      onChange={(event) => handleChange(event, tag)}
                      id={tag.id.toString()}
                      checked={filter.tags.some(t => t.id === tag.id)}
                      type="checkbox"
                      className="relative peer appearance-none w-4 h-4 border border-fg.2 rounded-default group-hover:border-fg.1 invisible checked:visible group-hover:visible checked:border-fg.1 checked:bg-fg.1" />
                    <Icon path={mdiCheckBold} size={2 / 3}
                      className="absolute w-3 h-3 hidden peer-checked:block text-float-bg.default pointer-events-none"
                    />
                    <span>
                      {tag.name}
                    </span>
                  </label>
                </CommandItem>
              ))}
            </div>
          </ScrollArea>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}
