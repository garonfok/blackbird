import { useAppDispatch } from "@/app/hooks";
import { tagsDelete, tagsGetAll, tagsUpdate } from "@/app/invokers";
import { Tag } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mdiDotsHorizontal
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { pushTag, removeTag } from "../reducers/filterSlice";
import { setTags } from "../reducers/tagsSlice";

const formSchema = z.object({
  name: z.string().min(1)
})

export function TagItem(props: {
  tag: Tag;
}) {
  const { tag } = props;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tag.name
    }
  })

  const ref = useRef<HTMLFormElement>(null)

  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    document.addEventListener("mouseup", handleClickOutside)
    return () => {
      document.removeEventListener("mouseup", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    document.getElementById("tagInput")?.focus()
  }, [isEditing])

  function handleClickOutside(event: globalThis.MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsEditing(false);
      form.reset()
    }
  }

  const dispatch = useAppDispatch();

  async function fetchTags() {
    const tags = await tagsGetAll()
    dispatch(setTags({ tags }));
  }

  function handleClickPushTag() {
    dispatch(pushTag(tag));
  }

  async function handleConfirmDeleteTag(id: number) {
    await tagsDelete({ id });
    dispatch(removeTag(id));
    await fetchTags();
  }

  async function onSubmitForm(data: z.infer<typeof formSchema>) {
    const { name } = data
    setIsEditing(false);
    await tagsUpdate({ id: tag.id, name });
    await fetchTags();
    form.setValue("name", name)
  }

  function handleClickEdit(event: globalThis.Event) {
    event.preventDefault();
    setIsEditing(true);
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form ref={ref} onSubmit={form.handleSubmit(onSubmitForm)} className="flex gap-[4px]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="tagInput" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" variant="secondary" className="leading-3">Save</Button>
        </form>
      </Form>
    )
  } else {
    return (
      <Button
        variant="sidebarCollapsibleItem"
        className="w-full group cursor-default"
      >
        <span className="flex gap-[4px] w-full items-center"
          onClick={handleClickPushTag}>
          <span>{tag.name}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="invisible group-hover:visible">
              <Icon path={mdiDotsHorizontal} size={1} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleClickEdit}>
              Edit
            </DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-error.default focus:text-error.focus">
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you sure you want to delete this tag?</DialogTitle>
                  <DialogDescription>
                    Pieces with this tag will not be deleted.
                  </DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button
                        variant="link"
                        type="reset"
                      >
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() => handleConfirmDeleteTag(tag.id)}
                      >
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
    )
  }

}
