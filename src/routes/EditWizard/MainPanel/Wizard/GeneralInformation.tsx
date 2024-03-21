import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Tag } from "@/app/types";
import { EditTagDialog } from "@/components/EditTagDialog";
import { SelectTags } from "@/components/SelectTags";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api/tauri";
import { useCallback, useEffect, useState } from "react";
import {
  setDifficulty,
  setNotes,
  setTags,
  setTitle,
  setYearPublished,
} from "../../pieceSlice";
import { SelectMusicians } from "./components/SelectMusicians";

export function GeneralInformation() {
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [allTags, setAllTags] = useState<Tag[]>([]);

  const piece = useAppSelector((state) => state.piece.present);
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchTags();
  }, []);

  async function fetchTags() {
    const tags = (await invoke("tags_get_all")) as Tag[];
    setAllTags(tags);
  }

  async function handleConfirmCreateTag(name: string, color: string) {
    const tagId = await invoke("tags_add", { name, color });
    await fetchTags();
    const tag = (await invoke("tags_get_by_id", { id: tagId })) as Tag;
    dispatch(setTags([...piece.tags, tag]));
  }

  const handleChangeYearPublished = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.value === "") {
        dispatch(setYearPublished(undefined));
        return;
      }
      const yearPublished = parseInt(event.currentTarget.value);
      if (isNaN(yearPublished)) return;
      dispatch(setYearPublished(yearPublished));
    },
    []
  );

  return (
    <>
      <div className="edit-wizard-panel">
        <div className="flex flex-col gap-[8px]">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            type="text"
            className="input-text"
            placeholder="Required"
            required
            value={piece.title}
            onChange={(event) => dispatch(setTitle(event.currentTarget.value))}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <Label htmlFor="yearPublished">Year Published</Label>
          <Input
            id="yearPublished"
            type="number"
            className="input-text [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            max={9999}
            value={piece.yearPublished}
            onInput={(event) =>
            (event.currentTarget.value = event.currentTarget.value.slice(
              0,
              4
            ))
            }
            onChange={handleChangeYearPublished}
          />
        </div>
        <SelectMusicians role="composer" required />
        <div className="flex flex-col gap-[8px]">
          <Label htmlFor="difficulty">Difficulty</Label>
          <Select value={piece.difficulty?.toString()} onValueChange={(value) => dispatch(setDifficulty(value === "None" ? undefined : Number(value)))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={"None"}>None</SelectItem>
              {Array.from({ length: 6 }, (_, i) => (
                <SelectItem key={i} value={(i + 1).toString()}>
                  {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-[8px]">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            rows={6}
            className="input-text resize-none"
            onChange={(event) => dispatch(setNotes(event.currentTarget.value))}
            value={piece.notes}
          />
        </div>
        <div className="flex flex-col gap-[8px]">
          <Label>Tags</Label>
          <SelectTags allTags={allTags} selected={piece.tags} onChange={(tags) => dispatch(setTags(tags))} />
          <Dialog open={createTagOpen} onOpenChange={setCreateTagOpen}>
            <DialogTrigger className="flex items-center gap-[8px] hover:text-fg.0 transition-default">
              <Icon path={mdiPlus} size={1} />
              <span>Create Tag</span>
            </DialogTrigger>
            <DialogContent>
              <EditTagDialog onConfirm={handleConfirmCreateTag} onClose={setCreateTagOpen} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </>
  );
}
