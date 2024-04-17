import { formatPartNumbers } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema, scoreFormSchema } from "../../types";
import { SortableItem } from "../SortableItem";
import { useState } from "react";

export function Scores(props: { pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>> }) {
  const { pieceForm } = props;

  const [activeItem, setActiveItem] = useState<null | z.infer<typeof scoreFormSchema>>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleClickAddScore() {
    pieceForm.setValue("scores", [
      ...pieceForm.getValues("scores"),
      {
        id: (Math.max(...pieceForm.getValues("scores").map((score) => score.id), 0) + 1),
        name: "Full Score",
      }
    ])
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const score = pieceForm.getValues("scores").find((score) => score.id === active.id);
    setActiveItem(score!);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = pieceForm.getValues("scores").findIndex((score) => score.id === active.id);
      const newIndex = pieceForm.getValues("scores").findIndex((score) => score.id === over?.id);
      const newScores = arrayMove(pieceForm.getValues("scores"), oldIndex, newIndex);
      pieceForm.setValue("scores", newScores);
    }

    formatPartNumbers(pieceForm);
    setActiveItem(null);
  }

  return (
    <FormField
      control={pieceForm.control}
      name="scores"
      render={({ field }) => (
        <div className="flex flex-col gap-[8px] h-full">
          <span className="flex gap-[14px] items-center">
            <Button type="button" variant='main' onClick={handleClickAddScore}>
              <Icon path={mdiPlus} size={2 / 3} />
              Add score
            </Button>
          </span>
          <Separator />
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              id="score-list"
              items={field.value}
              strategy={verticalListSortingStrategy}
            >
              <div className="h-full flex flex-col">
                <ScrollArea className="h-0 grow">
                  <div className="flex flex-col gap-[4px]">
                    {field.value.map((score) => (
                      <SortableItem key={score.id} id={score.id} pieceForm={pieceForm} type="scores" >
                        <span>{score.name}</span>
                      </SortableItem>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </SortableContext>
            <DragOverlay>
              {activeItem &&
                (<SortableItem id={activeItem.id} pieceForm={pieceForm} type="scores" >
                  <span>{activeItem.name}</span>
                </SortableItem>)
              }
            </DragOverlay>
          </DndContext>
        </div>
      )}
    />
  )
}
