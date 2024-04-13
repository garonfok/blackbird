import { Button } from '@/components/ui/button';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mdiDragVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { ReactNode } from 'react';

export function SortableItem(props: {
  id: UniqueIdentifier;
  children: ReactNode;
}) {
  const { id, children } = props;

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex item-center gap-[4px] p-[4px] bg-float-bg.default shadow-float rounded-default">
      <Button type="button" variant="main" className="p-1 h-fit self-center"  {...attributes} {...listeners}>
        <Icon path={mdiDragVertical} size={0.667} className="shrink-0 self-center" />
      </Button>
      {children}
    </div>
  );
}
