import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setlistsAdd, setlistsGetAll } from "@/invokers/db/setlists";
import { cn } from "@/utils/lib";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cards, CaretDown, Plus } from "@phosphor-icons/react";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { clearSetlist } from "../../../reducers/setlistSlice";
import { setSetlists } from "../../../reducers/setlistsSlice";
import { SetlistItem } from "./SetlistItem";

const setlistFormSchema = z.object({
  name: z.string().min(1),
});

export function Setlists() {
  const setlistForm = useForm<z.infer<typeof setlistFormSchema>>({
    resolver: zodResolver(setlistFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const newSetlistButtonRef = useRef<HTMLButtonElement>(null);
  const newSetlistRef = useRef<HTMLFormElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isNewSetlistOpen, setIsNewSetlistOpen] = useState(false);

  const dispatch = useAppDispatch();
  const setlist = useAppSelector((state) => state.setlist);
  const setlists = useAppSelector((state) => state.setlists);

  useEffect(() => {
    fetchSetlists();

    function handleClickOutside(e: globalThis.MouseEvent) {
      if (
        newSetlistRef.current &&
        !newSetlistRef.current.contains(e.target as Node) &&
        newSetlistButtonRef.current &&
        !newSetlistButtonRef.current.contains(e.target as Node)
      ) {
        setIsNewSetlistOpen(false);
        setlistForm.reset();
      }
    }
    document.addEventListener("mouseup", handleClickOutside);
    return () => document.removeEventListener("mouseup", handleClickOutside);
  }, []);

  async function fetchSetlists() {
    const setlists = await setlistsGetAll();
    dispatch(setSetlists({ setlists }));
  }

  async function onSubmitSetlistForm(data: z.infer<typeof setlistFormSchema>) {
    const { name } = data;
    setIsNewSetlistOpen(false);
    setlistForm.reset();
    await setlistsAdd({ name });
    await fetchSetlists();
  }

  function handleClickNewSetlist(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    setIsNewSetlistOpen(true);
    setIsOpen(true);
  }

  function handleClickNoSetlists(event: MouseEvent<HTMLButtonElement>): void {
    event.preventDefault();
    dispatch(clearSetlist());
  }

  return (
    <Collapsible
      className="flex flex-col gap-[4px]"
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <span className="flex items-center gap-[4px]">
        <CollapsibleTrigger className="w-full group">
          <Button
            variant="sidebarCollapsible"
            className="w-full flex gap-[4px]"
          >
            <CaretDown
              className="-rotate-90 group-data-[state=open]:rotate-0 transition-transform"
              weight="fill"
            />
            <span>Setlists</span>
          </Button>
        </CollapsibleTrigger>
        <Button
          ref={newSetlistButtonRef}
          variant="sidebarButton"
          className="p-[2px] justify-center"
          onClick={handleClickNewSetlist}
        >
          <Plus size={16} weight="bold" />
        </Button>
      </span>
      <CollapsibleContent className="flex flex-col gap-[2px]">
        <Button
          variant="sidebarCollapsibleItem"
          className={cn(
            "w-full group/item cursor-default",
            !setlist.setlist
              ? "bg-sidebar-bg.selected"
              : "hover:bg-sidebar-bg.focus",
          )}
          onClick={handleClickNoSetlists}
        >
          <span className="flex gap-[4px] w-full items-center truncate">
            <Cards
              size={16}
              weight="fill"
              className={cn("shrink-0", !setlist.setlist && "fill-fg.0")}
            />
            <span className="truncate">All pieces</span>
          </span>
        </Button>
        {isNewSetlistOpen && (
          <Form {...setlistForm}>
            <form
              ref={newSetlistRef}
              onSubmit={setlistForm.handleSubmit(onSubmitSetlistForm)}
              className="flex gap-[2px]"
            >
              <FormField
                control={setlistForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" variant="default" className="leading-3">
                Create
              </Button>
            </form>
          </Form>
        )}
        {setlists.map((sl) => (
          <SetlistItem
            key={sl.id}
            setlist={sl}
            selected={sl.id === setlist.setlist?.id}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
