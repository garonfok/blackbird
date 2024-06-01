import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { getWorkingDirectory, openFolder, openWizard, setlistsAdd, setlistsDelete, setlistsGetAll, setlistsUpdate, tagsAdd, tagsDelete, tagsGetAll, tagsUpdate } from "@/app/invokers";
import { Tag } from "@/app/types";
import { cn } from "@/app/utils";
import { EditTagDialog } from "@/components/EditTagDialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mdiBookOpenVariantOutline,
  mdiBookshelf,
  mdiDotsHorizontal,
  mdiMenuDown,
  mdiPlus,
  mdiTextBoxPlusOutline
} from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";
import { pushTag, removeTag } from "../reducers/filterSlice";
import { clearSetlist, setSetlist } from "../reducers/setlistSlice";
import { setSetlists } from "../reducers/setlistsSlice";
import { setTags } from "../reducers/tagsSlice";

const setlistFormSchema = z.object({
  name: z.string()
});

export function LeftPanel() {

  const setlistForm = useForm<z.infer<typeof setlistFormSchema>>({
    resolver: zodResolver(setlistFormSchema),
    defaultValues: {
      name: ""
    }
  });

  const [setlistCollapsibleOpen, setSetlistCollapsibleOpen] = useState(true);
  const [tagsCollapsibleOpen, setTagsCollapsibleOpen] = useState(true);
  const [directoryPath, setDirectoryPath] = useState("Blackbird Library");

  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);
  const setlist = useAppSelector((state) => state.setlist);
  const setlists = useAppSelector((state) => state.setlists);

  useEffect(() => {
    fetchTags();
    fetchSetlists();
    fetchDirectoryName()
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

  async function handleConfirmDeleteSetlist(id: number) {
    await setlistsDelete({ id });
    dispatch(clearSetlist());
    await fetchSetlists();
  }

  async function handleClickPushTag(tag: Tag) {
    dispatch(pushTag(tag));
  }

  async function handleConfirmDeleteTag(id: number) {
    await tagsDelete({ id });
    dispatch(removeTag(id));
    await fetchTags();
  }

  async function onSubmitSetlistForm(data: z.infer<typeof setlistFormSchema>, setlistId?: number) {
    if (setlistId) {
      await setlistsUpdate({ id: setlistId, name: data.name });
    } else {
      await setlistsAdd({ name: data.name });
    }
    await fetchSetlists();
  }

  async function onSubmitTagForm(name: string, tagId?: number) {
    if (tagId) {
      await tagsUpdate({ id: tagId, name });
    } else {
      await tagsAdd({ name });
    }
    await fetchTags();
  }

  async function openWizardWindow() {
    await openWizard({ pieceId: undefined });
  }

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <ScrollArea>
          <div className="h-screen">
            <div className="bg-sidebar-bg.default p-[14px] flex flex-col gap-[14px] h-full">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="sidebar" className="gap-[8px] justify-between group">
                    <span className="text-heading-default text-fg.0">
                      {directoryPath.split("/").pop() || directoryPath}
                    </span>
                    <Icon path={mdiDotsHorizontal} size={1} className="invisible group-hover:visible" />
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

              <Button variant="sidebar" className="gap-[8px]" onClick={() => openWizardWindow()}>
                <Icon path={mdiTextBoxPlusOutline} size={1} />
                <span>New piece</span>
              </Button>
              <div className="flex flex-col gap-[2px]">
                <Button
                  variant="sidebar"
                  onClick={() => dispatch(clearSetlist())}
                  className={cn(!setlist.setlist && "bg-sidebar-bg.focus")}
                >
                  <Icon path={mdiBookshelf} size={1} />
                  <span>All pieces</span>
                </Button>
                <Collapsible open={setlistCollapsibleOpen} onOpenChange={setSetlistCollapsibleOpen}>
                  <CollapsibleTrigger asChild className="w-full">
                    <span className="w-full flex items-center">
                      <Button variant="sidebarCollapisble" className="w-full">
                        <span>Setlists</span>
                        <Icon path={mdiMenuDown} size={1} className={cn(setlistCollapsibleOpen && "rotate-180")} />
                      </Button>
                      <Dialog onOpenChange={() => setlistForm.reset({ name: "" })}>
                        <DialogTrigger asChild>
                          <Button variant="sidebar" className="p-1 justify-center">
                            <Icon path={mdiPlus} size={1} />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create a new setlist</DialogTitle>
                          </DialogHeader>
                          <Form {...setlistForm}>
                            <form onSubmit={setlistForm.handleSubmit(() => onSubmitSetlistForm(setlistForm.getValues()))} className="space-y-[14px] text-fg.1">
                              <FormField
                                control={setlistForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    variant="link"
                                  >
                                    Cancel
                                  </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                  <Button type="submit" onClick={() => onSubmitSetlistForm(setlistForm.getValues())}>
                                    Create
                                  </Button>
                                </DialogClose>
                              </DialogFooter>
                            </form>
                          </Form>
                        </DialogContent>
                      </Dialog>
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="flex flex-col gap-[2px]">
                    {setlists.map((sl) => (
                      <div key={sl.id} className="flex gap-[4px] w-full">
                        <Button
                          asChild
                          variant="sidebar"
                          className={cn("w-full group", sl.id === setlist.setlist?.id && "bg-sidebar-bg.focus")}
                          onClick={() => dispatch(setSetlist({ setlist: sl }))}>
                          <div className="flex w-full">
                            <span className="flex gap-[8px] w-full items-center">
                              <Icon path={mdiBookOpenVariantOutline} size={1} />
                              <span>{sl.name}</span>
                            </span>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="link" className="invisible group-hover:visible">
                                  <Icon path={mdiDotsHorizontal} size={1} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <Form {...setlistForm}>
                                  <Dialog onOpenChange={() => setlistForm.reset({ name: sl.name })}>
                                    <DialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => {
                                        e.preventDefault()
                                        setlistForm.reset({ name: sl.name })
                                      }}>
                                        Edit
                                      </DropdownMenuItem>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Edit setlist</DialogTitle>
                                      </DialogHeader>
                                      <form onSubmit={setlistForm.handleSubmit(() => onSubmitSetlistForm(setlistForm.getValues(), sl.id))} className="space-y-[14px] text-fg.1">
                                        <FormField
                                          control={setlistForm.control}
                                          name="name"
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Name</FormLabel>
                                              <FormControl>
                                                <Input {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
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
                                            <Button type="submit" onClick={() => onSubmitSetlistForm(setlistForm.getValues(), sl.id)}>
                                              Save
                                            </Button>
                                          </DialogClose>
                                        </DialogFooter>
                                      </form>
                                    </DialogContent>
                                  </Dialog>
                                </Form>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-error.default focus:text-error.focus">
                                      Delete
                                    </DropdownMenuItem>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Are you sure you want to delete this setlist?</DialogTitle>
                                      <DialogDescription>
                                        Pieces in this setlist will not be deleted.
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
                                            onClick={() => handleConfirmDeleteSetlist(sl.id)}
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
                          </div>
                        </Button>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
              <Collapsible open={tagsCollapsibleOpen} onOpenChange={setTagsCollapsibleOpen}>
                <CollapsibleTrigger asChild className="w-full">
                  <span className="w-full flex items-center">
                    <Button variant="sidebarCollapisble" className="w-full">
                      <span>Tags</span>
                      <Icon path={mdiMenuDown} size={1} className={cn(tagsCollapsibleOpen && "rotate-180")} />
                    </Button>
                    <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="sidebar" className="p-1 justify-center">
                          <Icon path={mdiPlus} size={1} />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <EditTagDialog onConfirm={onSubmitTagForm} onClose={setIsTagDialogOpen} />
                      </DialogContent>
                    </Dialog>
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-[2px]">
                  {tags.map((tag) => (
                    <Button
                      asChild
                      key={tag.id}
                      variant="sidebar"
                      className="w-full group"
                      onClick={() => handleClickPushTag(tag)}>
                      <span>
                        <span className="flex gap-[8px] w-full items-center">
                          <span>{tag.name}</span>
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="link" className="invisible group-hover:visible">
                              <Icon path={mdiDotsHorizontal} size={1} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  Edit
                                </DropdownMenuItem>
                              </DialogTrigger>
                              <DialogContent>
                                <EditTagDialog defaultTag={tag} onConfirm={onSubmitTagForm} onClose={setIsTagDialogOpen} />
                              </DialogContent>
                            </Dialog>
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
                      </span>
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
              {/* <Button variant="sidebar" asChild>
                <Link
                  to="/settings" className="flex items-center gap-[8px]"
                >
                  <Icon path={mdiCog} size={1} />
                  <span>Settings</span>
                </Link>
              </Button> */}
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel >
      <ResizableHandle />
    </>
  );
}
