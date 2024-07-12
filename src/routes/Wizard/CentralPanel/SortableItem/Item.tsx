import { Instrument } from '@/app/types';
import { cn } from '@/app/utils';
import { Button } from '@/components/ui/button';
import { ComponentPropsWithRef, forwardRef } from 'react';

interface ItemProps extends ComponentPropsWithRef<"div"> {
  instrument: Instrument;
  onRemove?: () => void;
}

export const Item = forwardRef<HTMLDivElement, ItemProps>((props, ref?) => {
  const { instrument, onRemove } = props;

  return (
    <div {...props} className="flex items-center gap-2 px-[4px] py-[2px] w-full border border-divider.default rounded-default bg-bg.1 justify-between" ref={ref}>
      <span className="text-fg.2 select-none cursor-default text-xs">
        {instrument.name}
      </span>
      <Button
        variant="link"
        type="button"
        className={cn("text-xs text-fg.1", !onRemove && 'opacity-0')}
        onClick={onRemove!}
      >
        Remove
      </Button>
    </div>
  );
})
