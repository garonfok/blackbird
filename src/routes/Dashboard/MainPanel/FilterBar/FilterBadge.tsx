import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { ReactNode } from "react";

export function FilterBadge(props: { name: string, children: ReactNode, onClose: () => void }) {
  const { name, children, onClose } = props;
  return (
    <Badge variant="outline" className="p-0">
      <span className="text-fg.1 p-[4px]">{name}</span>
      <span className="flex gap-[4px] bg-bg.2 h-full w-full items-center border-l border-divider.default px-[4px]">
        {children}
        <Button
          onClick={() => onClose()}
          variant="link"
        >
          <Icon path={mdiClose} size={0.667} />
        </Button>
      </span>
    </Badge>
  )
}
