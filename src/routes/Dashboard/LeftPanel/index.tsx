import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getWorkingDirectory, openFolder, openWizard, setlistsAdd, setlistsGetAll, tagsAdd, tagsGetAll } from "@/app/invokers";
import { cn } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mdiBookshelf,
  mdiChevronDown,
  mdiMenuDown,
  mdiPlus,
  mdiTextBoxPlusOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { clearSetlist } from "../reducers/setlistSlice";
import { setSetlists } from "../reducers/setlistsSlice";
import { setTags } from "../reducers/tagsSlice";
import { SetlistItem } from "./SetlistItem";
import { TagItem } from "./TagItem";

const tagFormSchema = z.object({
  name: z.string().min(1)
})

const setlistFormSchema = z.object({
  name: z.string().min(1)
});

export function LeftPanel() {

  const setlistForm = useForm<z.infer<typeof setlistFormSchema>>({
    resolver: zodResolver(setlistFormSchema),
    defaultValues: {
      name: ""
    }
  });

  const tagForm = useForm<z.infer<typeof tagFormSchema>>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: ""
    }
  });

  const [setlistCollapsibleOpen, setSetlistCollapsibleOpen] = useState(true);
  const [tagsCollapsibleOpen, setTagsCollapsibleOpen] = useState(true);
  const [directoryPath, setDirectoryPath] = useState("Blackbird Library");
  const [isNewTagOpen, setIsNewTagOpen] = useState(false);
  const [isNewSetlistOpen, setIsNewSetlistOpen] = useState(false);

  const newTagRef = useRef<HTMLFormElement>(null);
  const newTagPlusRef = useRef<HTMLButtonElement>(null);
  const newSetlistRef = useRef<HTMLFormElement>(null);
  const newSetlistPlusRef = useRef<HTMLButtonElement>(null);

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);
  const setlist = useAppSelector((state) => state.setlist);
  const setlists = useAppSelector((state) => state.setlists);

  useEffect(() => {
    fetchTags();
    fetchSetlists();
    fetchDirectoryName();

    function handleClickOutside(e: globalThis.MouseEvent) {
      if (newTagRef.current && !newTagRef.current.contains(e.target as Node) && newTagPlusRef.current && !newTagPlusRef.current.contains(e.target as Node)) {
        setIsNewTagOpen(false);
        tagForm.reset();
      }
      if (newSetlistRef.current && !newSetlistRef.current.contains(e.target as Node) && newSetlistPlusRef.current && !newSetlistPlusRef.current.contains(e.target as Node)) {
        setIsNewSetlistOpen(false);
        setlistForm.reset();
      }
    };
    document.addEventListener("mouseup", handleClickOutside);
    return () => document.removeEventListener("mouseup", handleClickOutside);
  }, []);

  async function fetchDirectoryName() {
    const workingDirectory = await getWorkingDirectory()
    setDirectoryPath(workingDirectory)
  }

  async function handleClickOpenFolder() {
    await openFolder({ path: directoryPath })
  }

  async function fetchTags() {
    const tags = await tagsGetAll()
    dispatch(setTags({ tags }));
  }

  async function fetchSetlists() {
    const setlists = await setlistsGetAll()
    dispatch(setSetlists({ setlists }));
  }

  async function onSubmitTagForm(data: z.infer<typeof tagFormSchema>) {
    const { name } = data;
    setIsNewTagOpen(false);
    tagForm.reset();
    await tagsAdd({ name });
    await fetchTags();
  }

  async function onSubmitSetlistForm(data: z.infer<typeof setlistFormSchema>) {
    const { name } = data;
    setIsNewSetlistOpen(false);
    setlistForm.reset();
    await setlistsAdd({ name });
    await fetchSetlists();
  }

  async function openWizardWindow() {
    await openWizard({ pieceId: undefined });
  }

  function handleClickNewTag(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsNewTagOpen(true);
  }

  function handleClickNewSetlist(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsNewSetlistOpen(true)
  }

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <ScrollArea>
          <div className="bg-sidebar-bg.default p-[14px] flex flex-col gap-[8px]">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="sidebar" className=" group gap-[8px]">
                  <span className="text-heading-default text-fg.0">
                    {directoryPath.split("/").pop() || directoryPath}
                  </span>
                  <Icon path={mdiChevronDown} size={2 / 3} className="text-fg.1 invisible group-hover:visible" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onSelect={handleClickOpenFolder}>
                  Open directory
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings" className="flex items-center gap-[8px]"
                  >
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex flex-col gap-[4px]">
              <Button variant="sidebar" className="gap-[8px]" onClick={() => openWizardWindow()}>
                <Icon path={mdiTextBoxPlusOutline} size={1} />
                <span>New piece</span>
              </Button>
              <Button
                variant="sidebar"
                onClick={() => dispatch(clearSetlist())}
                className={cn(!setlist.setlist && "bg-sidebar-bg.focus")}
              >
                <Icon path={mdiBookshelf} size={1} />
                <span>All pieces</span>
              </Button>
            </div>

            <div className="flex flex-col gap-[4px]">
              <Collapsible open={setlistCollapsibleOpen} onOpenChange={setSetlistCollapsibleOpen} className="flex flex-col gap-[4px]">
                <span className="flex items-center gap-[4px]">
                  <CollapsibleTrigger asChild className="w-full">
                    <Button ref={newSetlistPlusRef} variant="sidebarCollapisble" className="w-full flex gap-[4px]">
                      <Icon path={mdiMenuDown} size={1} className={cn(setlistCollapsibleOpen && "rotate-180")} />
                      <span>Setlists</span>
                    </Button>
                  </CollapsibleTrigger>
                  <Button ref={newTagPlusRef} variant="sidebar" className="p-1 justify-center" onClick={handleClickNewSetlist}>
                    <Icon path={mdiPlus} size={1} />
                  </Button>
                </span>
                <CollapsibleContent className="flex flex-col gap-[2px]">
                  {isNewSetlistOpen && (
                    <Form {...setlistForm}>
                      <form ref={newSetlistRef} onSubmit={setlistForm.handleSubmit(onSubmitSetlistForm)} className="flex gap-[4px]">
                        <FormField control={setlistForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <Button type="submit" variant="secondary" className="leading-3">Create</Button>
                      </form>
                    </Form>
                  )}
                  {setlists.map((sl) => (
                    <SetlistItem key={sl.id} setlist={sl} selected={sl.id === setlist.setlist?.id} />
                  ))}
                </CollapsibleContent>
              </Collapsible>

              <Collapsible open={tagsCollapsibleOpen} onOpenChange={setTagsCollapsibleOpen} className="flex flex-col gap-[4px]">
                <span className="flex items-center gap-[4px]">
                  <CollapsibleTrigger asChild>
                    <Button variant="sidebarCollapisble" className="w-full flex gap-[4px]">
                      <Icon path={mdiMenuDown} size={1} className={cn(tagsCollapsibleOpen && "rotate-180")} />
                      <span>Tags</span>
                    </Button>
                  </CollapsibleTrigger>
                  <Button ref={newTagPlusRef} variant="sidebar" className="p-1 justify-center" onClick={handleClickNewTag}>
                    <Icon path={mdiPlus} size={1} />
                  </Button>
                </span>
                <CollapsibleContent className="flex flex-col gap-[2px] ml-7">
                  {isNewTagOpen && (
                    <Form {...tagForm}>
                      <form ref={newTagRef} onSubmit={tagForm.handleSubmit(onSubmitTagForm)} className="flex gap-[4px]">
                        <FormField control={tagForm.control} name="name" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </FormItem>
                        )} />
                        <Button type="submit" variant="secondary" className="leading-3">Create</Button>
                      </form>
                    </Form>
                  )}
                  {tags.map((tag) => (
                    <TagItem key={tag.id} tag={tag} />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel >
      <ResizableHandle />
    </>
  );
}
