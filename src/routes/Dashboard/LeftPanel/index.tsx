import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Setlist, Tag } from "@/app/types";
import { EditTagDialog } from "@/components/EditTagDialog";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  mdiBookOpenOutline,
  mdiBookshelf,
  mdiChevronDown,
  mdiCog,
  mdiDotsHorizontal,
  mdiPlus,
  mdiTag
} from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
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

  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);

  const dispatch = useAppDispatch();
  const tags = useAppSelector((state) => state.tags);
  const setlist = useAppSelector((state) => state.setlist);
  const setlists = useAppSelector((state) => state.setlists);

  useEffect(() => {
    fetchTags();
    fetchSetlists();
  }, []);

  async function fetchTags() {
    const tags = (await invoke("tags_get_all")) as Tag[];
    dispatch(setTags({ tags }));
  }

  async function fetchSetlists() {
    const setlists = (await invoke("setlists_get_all")) as Setlist[];
    dispatch(setSetlists({ setlists }));
  }

  async function handleConfirmDeleteSetlist(id: number) {
    await invoke("setlists_delete", { id });
    dispatch(clearSetlist());
    await fetchSetlists();
  }

  async function handleClickPushTag(tag: Tag) {
    dispatch(pushTag(tag));
  }

  async function handleConfirmDeleteTag(id: number) {
    await invoke("tags_delete", { id });
    dispatch(removeTag(id));
    await fetchTags();
  }

  async function onSubmitSetlistForm(data: z.infer<typeof setlistFormSchema>, setlistId?: number) {
    if (setlistId) {
      await invoke("setlists_update", { id: setlistId, name: data.name });
    } else {
      await invoke("setlists_add", { name: data.name });
    }
    await fetchSetlists();
  }

  async function onSubmitTagForm(name?: string, color?: string, tagId?: number) {
    if (tagId) {
      await invoke("tags_update", { id: tagId, name, color });
    } else {
      await invoke("tags_add", { name, color });
    }
    await fetchTags();
  }

  return (
    <>
      <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
        <div className="p-[14px] flex flex-col h-full gap-[14px]">
          <Button variant="primary" size="default" asChild>
            <Link to="/edit-wizard">
              New piece
            </Link>
          </Button>
          <div className="flex flex-col gap-[14px] overflow-y-auto max-h-[50%] scrollbar-default">
            <button
              onClick={() => dispatch(clearSetlist())}
              className={classNames(
                "flex items-center gap-[14px] w-full hover:text-fg.0 transition-default",
                !setlist.setlist ? "text-fg.0" : "text-fg.1"
              )}
            >
              <Icon path={mdiBookshelf} size={1} />
              <span>All pieces</span>
            </button>
            <Form {...setlistForm}>
              <Dialog onOpenChange={() => setlistForm.reset({ name: "" })}>
                <DialogTrigger className="flex gap-[14px] hover:text-fg.0 transition-default">
                  <Icon path={mdiPlus} size={1} />
                  <span>Create setlist</span>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create a new setlist</DialogTitle>
                  </DialogHeader>
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
                      <DialogClose>
                        <Button
                          variant="link"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose>
                        <Button type="submit" onClick={() => onSubmitSetlistForm(setlistForm.getValues())}>
                          Create
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </Form>
            {setlists.map((sl) => (
              <div key={sl.id} className="flex gap-[4px] w-full">
                <button
                  className={classNames(
                    "flex items-center gap-[14px] w-full hover:text-fg.0 truncate transition-default",
                    setlist.setlist?.id === sl.id ? "text-fg.0" : "text-fg.1"
                  )}
                  onClick={() => dispatch(setSetlist({ setlist: sl }))}
                >
                  <Icon
                    path={mdiBookOpenOutline}
                    size={1}
                    className="shrink-0"
                  />
                  <span className="truncate w-full text-left">{sl.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="link">
                      <Icon path={mdiDotsHorizontal} size={1} className="link" />
                    </button>
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
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-error.default focus:text-error.default">
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
            ))}
          </div>
          <Separator />
          <Collapsible
            open={isTagsOpen}
            onOpenChange={setIsTagsOpen}
            className="flex flex-col gap-[14px] h-0 flex-grow"
          >
            <span className="flex gap-[14px] justify-between">
              <CollapsibleTrigger className="flex gap-[14px]">
                <Icon
                  path={mdiChevronDown}
                  size={1}
                  className={classNames(
                    "transition-default",
                    isTagsOpen && "rotate-180"
                  )}
                />
                <span>Tags</span>
              </CollapsibleTrigger>
              <Dialog open={isTagDialogOpen} onOpenChange={setIsTagDialogOpen}>
                <DialogTrigger className="hover:text-fg.0 transition-default">
                  <Icon path={mdiPlus} size={1} />
                </DialogTrigger>
                <DialogContent>
                  <EditTagDialog onConfirm={() => onSubmitTagForm} onClose={setIsTagDialogOpen} />
                </DialogContent>
              </Dialog>
            </span>
            <CollapsibleContent asChild>
              <ul className="ml-[14px] overflow-y-auto flex flex-col gap-[8px] scrollbar-default">
                {tags.map((tag) => (
                  <li
                    key={tag.id}
                    className="flex items-center gap-[4px] w-full text-fg.1">
                    <button
                      className="flex gap-[14px] w-full link truncate"
                      onClick={() => handleClickPushTag(tag)}
                    >
                      <Icon
                        path={mdiTag}
                        className="shrink-0"
                        size={1}
                        color={tag.color}
                      />
                      <div className="w-full truncate text-left">
                        {tag.name}
                      </div>
                    </button><DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="link">
                          <Icon path={mdiDotsHorizontal} size={1} className="link" />
                        </button>
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
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-error.default focus:text-error.default">
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
                  </li>
                ))}
              </ul>
            </CollapsibleContent>
          </Collapsible>
          <Separator />
          <Link
            to="/settings"
            className="flex gap-[14px] items-center link"
          >
            <Icon path={mdiCog} size={1} />
            <span>Settings</span>
          </Link>
        </div>
      </ResizablePanel >
      <ResizableHandle withHandle />
    </>
  );
}
