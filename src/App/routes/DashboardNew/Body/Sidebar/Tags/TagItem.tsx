import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { tagsDelete, tagsGetAll, tagsUpdate } from "@/invokers/db/tags";
import { Tag } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { DotsThreeOutline, Tag as TagIcon } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { pushTag, removeTag } from "../../../reducers/filterSlice";
import { setTags } from "../../../reducers/tagsSlice";
import { cn } from "@/utils/lib";

const formSchema = z.object({
  name: z.string().min(1),
});

export function TagItem(props: { tag: Tag }) {
  const { tag } = props;

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.filter.tags);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag.name,
    },
  });

  const ref = useRef<HTMLFormElement>(null);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    document.addEventListener("mouseup", handleClickOutside);
    return () => {
      document.removeEventListener("mouseup", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.getElementById("tagInput")?.focus();
  }, [isEditing]);

  function handleClickOutside(event: globalThis.MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsEditing(false);
      form.reset();
    }
  }

  async function fetchTags() {
    const tags = await tagsGetAll();
    dispatch(setTags({ tags }));
  }

  function handleClickToggleTag() {
    if (tags.includes(tag)) {
      dispatch(removeTag(tag.id));
    } else {
      dispatch(pushTag(tag));
    }
  }

  async function handleConfirmDeleteTag(id: number) {
    await tagsDelete({ id });
    dispatch(removeTag(id));
    await fetchTags();
  }

  async function onSubmitForm(data: z.infer<typeof formSchema>) {
    const { name } = data;
    setIsEditing(false);
    await tagsUpdate({ id: tag.id, name });
    await fetchTags();
    form.setValue("name", name);
  }

  function handleClickEdit(event: globalThis.Event) {
    event.preventDefault();
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmitForm)}
          className="flex gap-[2px]"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input id="tagInput" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" variant="default" className="leading-3">
            Save
          </Button>
        </form>
      </Form>
    );
  } else {
    return (
      <Button
        variant="sidebarCollapsibleItem"
        className={cn(
          "w-full group/item cursor-default",
          tags.includes(tag)
            ? "bg-sidebar-bg.selected"
            : "hover:bg-sidebar-bg.focus",
        )}
        onClick={handleClickToggleTag}
      >
        <span className="flex gap-[4px] w-full items-center truncate">
          <TagIcon
            weight="fill"
            size={16}
            className={cn("shrink-0", tags.includes(tag) && "fill-fg.0")}
          />
          <span className="truncate">{tag.name}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger className="group/trigger flex">
            <Button
              variant="link"
              className="invisible group-hover/item:visible group-data-[state=open]/trigger:visible p-0"
            >
              <DotsThreeOutline size={16} weight="fill" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleClickEdit}>Edit</DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete this tag?
                  </DialogTitle>
                  <DialogDescription>
                    Pieces with this tag will not be deleted.
                  </DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="link" type="reset">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={() => handleConfirmDeleteTag(tag.id)}>
                        Delete
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </Button>
    );
  }
}
