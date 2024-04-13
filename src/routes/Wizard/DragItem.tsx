import { ByteFile } from "@/app/types";
import { mdiFile } from "@mdi/js";
import Icon from "@mdi/react";
import { Ref, forwardRef } from "react";

export const DragItem = forwardRef((props: {
  file: ByteFile;
}, ref: Ref<HTMLDivElement>) => {
  const { file } = props;

  return (
    <div ref={ref} className="flex item-center gap-[4px] p-[4px] bg-float-bg.default shadow-float rounded-default w-fit">
      <Icon path={mdiFile} size={0.667} className="shrink-0 self-center" />
      <span className="text-body-small-default text-fg.2 self-center">
        {file.name}
      </span>
    </div>
  );
}
)
