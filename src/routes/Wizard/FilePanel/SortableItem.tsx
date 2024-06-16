import { ByteFile } from '@/app/types';
import { Button } from '@/components/ui/button';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mdiDragVertical } from '@mdi/js';
import Icon from '@mdi/react';

export function SortableItem(props: {
  file: ByteFile;
  onRemoveFile: () => void
}) {
  const { file, onRemoveFile } = props;

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: `f${file.id}` as UniqueIdentifier,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
  };

  function getFileSize(byteArray: Uint8Array) {
    // parse bytes to nearest unit
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (byteArray.length === 0) return '0 Byte';
    const i = Math.floor(Math.log(byteArray.length) / Math.log(1024));
    return `${Math.round(byteArray.length / Math.pow(1024, i))} ${sizes[i]}`;
  }

  function handleClickOpen() {

  }

  function handleClickDelete() {
    onRemoveFile();
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow ref={setNodeRef} style={style} className="text-xs border-none hover:bg-transparent">
          <TableCell className="flex items-center gap-[4px]">
            <Button variant='sidebar' className="p-1" {...attributes} {...listeners}>
              <Icon path={mdiDragVertical} size={2 / 3} />
            </Button>
            <div className="relative flex w-full items-center">
              <div className="absolute truncate w-full pr-2">
                {file.name}
              </div></div>
          </TableCell>
          <TableCell className="whitespace-nowrap w-[75px] text-fg.2">{getFileSize(file.bytearray)}</TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
      <ContextMenuItem onClick={handleClickOpen}>Open</ContextMenuItem>
      <ContextMenuItem onClick={handleClickDelete}>Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
