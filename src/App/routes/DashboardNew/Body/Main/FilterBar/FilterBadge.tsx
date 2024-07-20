import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "@phosphor-icons/react";
import { ReactNode } from "react";

export function FilterBadge(props: {
  name: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const { name, children, onClose } = props;
  return (
    <Badge variant="outline" className="p-0">
      <span className="text-fg.1 p-[4px]">{name}</span>
      <span className="flex gap-[4px] bg-bg.2 h-full w-full items-center border-l border-divider.default p-[4px]">
        {children}
        <Button onClick={() => onClose()} variant="link" className="p-0">
          <X size={16} weight="bold" />
        </Button>
      </span>
    </Badge>
  );
}
