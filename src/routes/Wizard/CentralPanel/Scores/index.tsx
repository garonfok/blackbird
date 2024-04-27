import { ByteFile } from "@/app/types";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema } from "../../types";
import { SortableItem } from "../SortableItem";

export function Scores(props: {
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>
  uploadedFiles: ByteFile[]
}) {
  const { pieceForm, uploadedFiles } = props;

  function handleClickAddScore(field: ControllerRenderProps<z.infer<typeof pieceFormSchema>, "scores">) {
    field.onChange([
      ...field.value,
      {
        id: (Math.max(...field.value.map((score) => score.id), 0) + 1),
        name: "Full Score",
      }
    ])
  }

  return (
    <FormField
      control={pieceForm.control}
      name="scores"
      render={({ field }) => (
        <div className="flex flex-col gap-[8px] h-full">
          <span className="flex gap-[14px] items-center">
            <Button type="button" variant='main' onClick={() => handleClickAddScore(field)}>
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
                  {field.value.map((score) => (
                    <SortableItem key={score.id} id={`s${score.id}`} pieceForm={pieceForm} item={score} uploadedFiles={uploadedFiles} />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SortableContext>
        </div>
      )}
    />
  )
}
