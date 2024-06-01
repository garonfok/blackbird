import { tagsAdd, tagsDelete, tagsGetAll, tagsUpdate } from "@/app/invokers";
import { Tag } from "@/app/types";
import { EditTagDialog } from "@/components/EditTagDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { mdiPencil, mdiTrashCan } from "@mdi/js";
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

  async function onSubmitTagForm(name: string, tagId?: number) {
    if (tagId) {
      await tagsUpdate({ id: tagId, name });
    } else {
      await tagsAdd({ name });
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
      <div className="flex flex-col gap-[4px]">
        {tags.map((tag, index) => (
          <Badge variant="outline" key={tag.id} className="w-full group gap-[8px]">
            <span className="flex gap-[8px] items-center">
              <span className="text-fg.0">{tag.name}</span>
            </span>
            <span className="flex gap-[4px] items-center group-hover:visible invisible">
              <Dialog open={editOpen[index]} onOpenChange={(open) => {
                const newEditOpen = [...editOpen]
                newEditOpen[index] = open
                setEditOpen(newEditOpen)
              }}>
                <DialogTrigger asChild>
                  <Button variant="main" className="p-1">
                    <Icon path={mdiPencil} size={2 / 3} />
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
                  <Button variant="main" className="p-1">
                    <Icon path={mdiTrashCan} size={2 / 3} />
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
          </Badge>
        ))}
      </div>
    </ContentWrapper>
  );
}
