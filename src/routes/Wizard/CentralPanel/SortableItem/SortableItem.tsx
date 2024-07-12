import { Instrument } from '@/app/types';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Item } from './Item';

export function SortableItem(props: { id: UniqueIdentifier, instrument: Instrument, onRemove?: () => void }) {

  const { id, instrument, onRemove } = props

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
    <Item ref={setNodeRef} style={style} {...attributes} {...listeners} instrument={instrument} onRemove={onRemove} />
  );
}
