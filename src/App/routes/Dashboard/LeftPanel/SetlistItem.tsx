import { useAppDispatch } from "@/hooks/store";
import { setlistsDelete, setlistsGetAll, setlistsUpdate } from "@/invokers/db/setlists";
import { Setlist } from "@/types";
import { cn } from "@/utils/lib";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { mdiBookOpenVariantOutline, mdiDotsHorizontal } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { clearSetlist, setSetlist } from "../reducers/setlistSlice";
import { setSetlists } from "../reducers/setlistsSlice";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(1),
});

export function SetlistItem(props: { setlist: Setlist; selected?: boolean }) {
  const { setlist, selected } = props;

  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: setlist.name,
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
    document.getElementById("setlistInput")?.focus();
  }, [isEditing]);

  function handleClickOutside(event: globalThis.MouseEvent) {
    if (ref.current && !ref.current.contains(event.target as Node)) {
      setIsEditing(false);
      form.reset();
    }
  }

  function handleClickSetSetlist() {
    dispatch(setSetlist({ setlist }));
  }

  async function fetchSetlists() {
    const setlists = await setlistsGetAll();
    dispatch(setSetlists({ setlists }));
  }

  async function handleConfirmDeleteSetlist(id: number) {
    await setlistsDelete({ id });
    dispatch(clearSetlist());
    await fetchSetlists();
  }

  function handleClickEdit(event: globalThis.Event) {
    event.preventDefault();
    setIsEditing(true);
  }

  async function onSubmitForm(data: z.infer<typeof formSchema>) {
    const { name } = data;
    setIsEditing(false);
    await setlistsUpdate({ id: setlist.id, name });
    await fetchSetlists();
    form.setValue("name", name);
  }

  if (isEditing) {
    return (
      <Form {...form}>
        <form
          ref={ref}
          onSubmit={form.handleSubmit(onSubmitForm)}
          className="flex gap-[4px]"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input id="setlistInput" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" variant="secondary" className="leading-3">
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
          "w-full group cursor-default",
          selected && "bg-sidebar-bg.focus",
        )}
      >
        <span
          className="flex gap-[4px] w-full items-center pl-[3px]"
          onClick={handleClickSetSetlist}
        >
          <Icon
            path={mdiBookOpenVariantOutline}
            size={2 / 3}
            className="mb-[2px]"
          />
          <span>{setlist.name}</span>
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="link"
              className="invisible group-hover:visible p-0"
            >
              <Icon path={mdiDotsHorizontal} size={1} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={handleClickEdit}>Edit</DropdownMenuItem>
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  className="text-error.default focus:text-error.focus"
                >
                  Delete
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure you want to delete this setlist?
                  </DialogTitle>
                  <DialogDescription>
                    Pieces in this setlist will not be deleted.
                  </DialogDescription>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="link" type="reset">
                        Cancel
                      </Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() => handleConfirmDeleteSetlist(setlist.id)}
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
    );
  }
}
