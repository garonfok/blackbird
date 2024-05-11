
import { tagsAdd, tagsGet, tagsGetAll } from "@/app/invokers";
import { Tag } from "@/app/types";
import { cn } from "@/app/utils";
import { EditTagDialog } from "@/components/EditTagDialog";
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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mdiCheck, mdiChevronDown, mdiCircle, mdiClose, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { Ref, forwardRef, useEffect, useState } from "react";

export const SelectTags = forwardRef((props: { value: Tag[], onChange: (tags: Tag[]) => void }, ref: Ref<HTMLDivElement>) => {
  const { value, onChange } = props;

  const [tags, setTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    fetchTags();
  }, [])

  async function fetchTags() {
    const fetchedTags = await tagsGetAll()
    setTags(fetchedTags);
  }

  async function onCreateTag(name: string, color: string) {
    const tagId = await tagsAdd({ name, color });
    await fetchTags();
    const tag = await tagsGet({ id: tagId });
    onChange([...value, tag]);
  }

  return (
    <FormItem className='flex flex-col gap-[4px]' ref={ref}>
      <span className="flex gap-[8px] items-center">
        <FormLabel>Tags</FormLabel>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="flex items-center gap-[4px] p-1" variant='main'>
              <Icon path={mdiPlus} size={0.667} />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <EditTagDialog onConfirm={onCreateTag} onClose={setCreateOpen} />
          </DialogContent>
        </Dialog>
      </span>
      <FormControl>
        <Popover open={open} onOpenChange={setOpen} {...props}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn("w-full justify-between border-divider.default bg-bg.2")}
              onClick={() => setOpen(!open)}
            >
              <div className="flex gap-1 flex-wrap">
                {value.length > 0 ? value.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="mr-1 mb-1"
                  >
                    <Icon path={mdiCircle} size={0.667} color={tag.color} className="mr-1" />
                    {tag.name}
                    <Button
                      type="button"
                      variant="link"
                      className="p-1"
                      onClick={() => onChange(value.filter((t) => t.id !== tag.id))}
                    >
                      <Icon path={mdiClose} size={0.667} className="text-fg.2 hover:text-fg.0" />
                    </Button>
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
                      {tags.map((tag) => (
                        <CommandItem
                          key={tag.id}
                          onSelect={() => {
                            onChange(
                              value.map(t => t.id).includes(tag.id)
                                ? value.filter((t) => t.id !== tag.id)
                                : [...value, tag]
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
                              value.map(t => t.id).includes(tag.id) ?
                                "opacity-100" : "opacity-0"
                            )}
                          />
                          <Icon path={mdiCircle} size={0.667} color={tag.color} className="mr-1" />
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
      </FormControl>
      <FormMessage />
    </FormItem>
  )
})
