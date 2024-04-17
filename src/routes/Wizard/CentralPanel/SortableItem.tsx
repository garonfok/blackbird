import { formatPartNumbers } from "@/app/utils";
import { Button } from "@/components/ui/button";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { mdiClose, mdiDragVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { ReactNode } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema } from "../types";

export function SortableItem(props: {
  id: UniqueIdentifier;
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
  type: "parts" | "scores";
  children: ReactNode;
}) {
  const { id, pieceForm, type, children } = props;

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  function handleClickRemoveItem() {
    pieceForm.setValue(type, pieceForm.getValues(type).filter((item) => item.id !== id));
    formatPartNumbers(pieceForm);
  }

  return (
    <div ref={setNodeRef} style={style} className="flex item-center gap-[4px] p-[4px] border border-divider.default rounded-default bg-main-bg.default">
      <Button type="button" variant="main" className="p-1 h-fit self-center"  {...attributes} {...listeners}>
        <Icon path={mdiDragVertical} size={0.667} className="shrink-0 self-center" />
      </Button>
      <span className="grow self-center">
        {children}
      </span>
      <span className="h-8 bg-sidebar-bg.default w-48  rounded-default" />
      <Button type="button" variant="main" className="p-1 h-fit self-center" onClick={handleClickRemoveItem}>
        <Icon path={mdiClose} size={0.667} className="shrink-0 self-center" />
      </Button>
    </div>
  )
}
