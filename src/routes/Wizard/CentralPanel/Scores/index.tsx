import { ByteFile } from "@/app/types";
import { Button } from "@/components/ui/button";
import { CheckedState } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { MouseEvent, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema } from "../../types";
import { SortableItem } from "../SortableItem";

export function Scores(props: {
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
  uploadedFiles: ByteFile[];
}) {
  const { pieceForm, uploadedFiles } = props;

  const [anchor, setAnchor] = useState(0);
  const [checkedMap, setCheckedMap] = useState(new Map<string, CheckedState>());

  function handleClickAddScore(
    field: ControllerRenderProps<z.infer<typeof pieceFormSchema>, "scores">,
  ) {
    const id = Math.max(...field.value.map((score) => score.id), 0) + 1;

    field.onChange([
      ...field.value,
      {
        id,
        name: "Full Score",
      },
    ]);

    setCheckedMap(new Map(checkedMap.set(`s${id}`, false)));
  }

  function handleClickCheck(
    event: MouseEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.shiftKey) {
      let adjustedAnchor = anchor;

      while (pieceForm.getValues("scores")[adjustedAnchor] === undefined) {
        adjustedAnchor--;
      }

      const min = Math.min(adjustedAnchor, index);
      let max = Math.max(adjustedAnchor, index);
      const selected = pieceForm.getValues("scores")[index]!;
      const selectedChecked = checkedMap.get(`s${selected.id}`);

      for (let i = min; i <= max; i++) {
        const score = pieceForm.getValues("scores")[i]!;
        checkedMap.set(`s${score.id}`, !selectedChecked);
      }
    } else {
      const score = pieceForm.getValues("scores")[index]!;
      checkedMap.set(`s${score.id}`, !checkedMap.get(`s${score.id}`));
    }
    setCheckedMap(new Map(checkedMap));
    setAnchor(index);
  }

  return (
    <FormField
      control={pieceForm.control}
      name="scores"
      render={({ field }) => (
        <div className="flex flex-col gap-[8px] h-full">
          <span className="flex gap-[14px] items-center">
            <Button
              type="button"
              variant="main"
              onClick={() => handleClickAddScore(field)}
            >
              <Icon path={mdiPlus} size={2 / 3} />
              Add score
            </Button>
          </span>
          <Separator />
          <SortableContext
            id="score-list"
            items={field.value.map((score) => `s${score.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="h-full flex flex-col">
              <ScrollArea className="h-0 grow">
                <div className="flex flex-col gap-[4px]">
                  {field.value.map((score, index) => (
                    <SortableItem
                      key={score.id}
                      id={`s${score.id}`}
                      pieceForm={pieceForm}
                      item={score}
                      uploadedFiles={uploadedFiles}
                      checkedMap={checkedMap}
                      setCheckedMap={setCheckedMap}
                      handleClickCheck={(event) =>
                        handleClickCheck(event, index)
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SortableContext>
        </div>
      )}
    />
  );
}
