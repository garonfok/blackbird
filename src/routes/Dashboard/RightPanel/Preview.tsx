import { useAppDispatch } from "@/app/hooks";
import { Piece, Tag } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { mdiCircle, mdiCircleOutline, mdiMenuDown } from "@mdi/js";
import Icon from "@mdi/react";
import { pushTag } from "../reducers/filterSlice";
import { invoke } from "@tauri-apps/api";

export function Preview(props: { piece: Piece }) {
  const { piece } = props;

  const dispatch = useAppDispatch();

  async function handleClickOpenDirectory(path: string) {
    await invoke("open", { path });
  }

  async function handleClickPushTag(tag: Tag) {
    dispatch(pushTag(tag));
  }

  const roles = [
    {
      name: "Composed By",
      musicians: piece.composers,
    },
    {
      name: "Arranged By",
      musicians: piece.arrangers,
    },
    {
      name: "Orchestrated By",
      musicians: piece.orchestrators,
    },
    {
      name: "Transcribed By",
      musicians: piece.transcribers,
    },
    {
      name: "Lyrics By",
      musicians: piece.lyricists,
    }
  ]

  return (
    piece && (
      <div className="flex flex-col gap-[14px] flex-grow">
        <div className="flex flex-wrap gap-[14px] px-[14px]">
          {piece.tags.map((tag) => {
            return (
              <Badge
                variant="outline"
                className="gap-[4px] hover:text-fg.0 hover:border-divider.focus"
                onClick={() => handleClickPushTag(tag)}
              >
                <Icon path={mdiCircle} size={0.667} style={{ color: tag.color }} />
                {tag.name}
              </Badge>
            );
          })}
        </div>
        <div className="flex flex-col gap-[14px] px-[14px]">
          <div className="flex flex-col gap-[4px]">
            {piece.difficulty && (
              <span className="text-fg.1 text-body-small-default">Grade {piece.difficulty}</span>
            )}
            <span className="text-heading-default">{piece.title}</span>
            {piece.year_published && (
              <span className="text-fg.1 text-body-small-default">{piece.year_published}</span>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary" className="text-left w-fit">
                Show all credits
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Credits</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-[14px]">
                {roles.filter(role => role.musicians.length > 0).map((role) => (
                  <div>
                    <Label htmlFor={role.name}>{role.name}</Label>
                    <span className="flex flex-wrap text-fg.2">
                      {role.musicians
                        .map((musician) =>
                          [musician.first_name, musician.last_name].join(" ")
                        )
                        .join(", ")}
                    </span>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
        <ScrollArea className="overflow-y-scroll h-0 grow">
          <div className="flex flex-col gap-[14px] px-[14px]">
            <div className="flex flex-col">
              {piece.scores.map((score) => (
                <div key={score.id} className="text-sm justify-between gap-[4px] text-fg.2 px-2 py-1 flex items-center group">
                  <span className="flex items-center gap-[4px]">
                    <Icon
                      path={!score.path ? mdiCircleOutline : mdiCircle}
                      size={0.667}
                    />
                    <span>{score.name}</span>
                  </span>
                  {score.path && <Button variant='link' className="invisible group-hover:visible" onClick={() => handleClickOpenDirectory(score.path!)}>Open file</Button>}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {piece.parts.map((part) => (
                <div key={part.id}>
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="sidebarCollapisble" className="w-full justify-between gap-[4px] group">
                        <span className="flex items-center gap-[4px]">
                          <Icon
                            path={!part.path ? mdiCircleOutline : mdiCircle}
                            size={0.667}
                          />
                          <span>{part.name}</span>
                          <Icon
                            path={mdiMenuDown}
                            size={1}
                            className="group-data-[state=open]:rotate-180"
                          />
                        </span>
                        {part.path && <Button variant='link' className="invisible group-hover:visible" onClick={() => handleClickOpenDirectory(part.path!)}>Open file</Button>}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <span className="flex flex-wrap text-fg.1 ml-8">
                        {part.instruments
                          .map((instrument) => instrument.name)
                          .join(", ")}
                      </span>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea >
        <Separator />
        {piece.notes.length > 0 && (
          <div className="break-words px-[14px] py-[8px]">
            <Label htmlFor="notes">Notes</Label>
            <p>
              {piece.notes}
            </p>
          </div>
        )}
      </div >
    )
  );
}
