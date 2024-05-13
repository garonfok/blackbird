import { tagsAdd, tagsDelete, tagsGetAll, tagsUpdate } from "@/app/invokers";
import { Tag } from "@/app/types";
import { cn } from "@/app/utils";
import { EditTagDialog } from "@/components/EditTagDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { mdiCircle, mdiPencil, mdiTrashCan } from "@mdi/js";
import Icon from "@mdi/react";
import { useEffect, useState } from "react";
import { ContentWrapper } from "../components/ContentWrapper";

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [editOpen, setEditOpen] = useState<boolean[]>([]);
  const [newTagOpen, setNewTagOpen] = useState(false);

  useEffect(() => {
    fetchTags()
  }, [])

  async function fetchTags() {
    const tags = await tagsGetAll()
    setTags(tags)
    setEditOpen(new Array(tags.length).fill(false))
  }

  async function onSubmitTagForm(name: string, color: string, tagId?: number) {
    if (tagId) {
      await tagsUpdate({ id: tagId, name, color });
    } else {
      await tagsAdd({ name, color });
    }
    await fetchTags();
  }

  async function handleClickDeleteTag(tagId: number) {
    await tagsDelete({ id: tagId })
    await fetchTags()
  }

  return (
    <ContentWrapper value="tags" name="Tags">
      <Dialog open={newTagOpen} onOpenChange={setNewTagOpen}>
        <DialogTrigger asChild>
          <Button className="w-fit">
            New tag
          </Button>
        </DialogTrigger>
        <DialogContent>
          <EditTagDialog onConfirm={onSubmitTagForm} onClose={setNewTagOpen} />
        </DialogContent>
      </Dialog>
      <div className="flex flex-col">
        {tags.map((tag, index) => (
          <>
            <div key={tag.id} className="flex items-center justify-between p-[14px] group">
              <span className="flex gap-[8px] items-center">
                <Icon path={mdiCircle} size={1} color={tag.color} />
                <span>{tag.name}</span>
              </span>
              <span className="flex gap-[8px] items-center group-hover:visible invisible">
                <Dialog open={editOpen[index]} onOpenChange={(open) => {
                  const newEditOpen = [...editOpen]
                  newEditOpen[index] = open
                  setEditOpen(newEditOpen)
                }}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="p-1">
                      <Icon path={mdiPencil} size={1} />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <EditTagDialog
                      defaultTag={tag}
                      onConfirm={onSubmitTagForm}
                      onClose={
                        () => {
                          const newEditOpen = [...editOpen]
                          newEditOpen[index] = false
                          setEditOpen(newEditOpen)
                        }} />
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="link" className="p-1">
                      <Icon path={mdiTrashCan} size={1} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete the "{tag.name}" tag?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Pieces containing this tag will not be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button onClick={() => handleClickDeleteTag(tag.id)}>Delete</Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </span>
            </div>
            <Separator className={cn(index < tags.length - 1 ? "visible" : "invisible")} />
          </>
        ))}
      </div>
    </ContentWrapper>
  );
}
