import { PropsWithChildren } from "react";

export function ContextMenu(
  props: PropsWithChildren<{ x: number; y: number }>
) {
  const { x, y, children } = props;

  return (
    <div
      className="flex flex-col w-[192px] p-[4px] rounded-[4px] absolute bg-bg.inset shadow-float"
      style={{ left: x, top: y }}
    >
      {children}
    </div>
  );
}

function Item(props: { onClick: () => void; label: string }) {
  const { label, onClick } = props;

  return (
    <button
      onClick={onClick}
      className="flex items-center w-full px-[4px] py-[2px] rounded-[4px] text-fg.default hover:bg-bg.default transition-all"
    >
      {label}
    </button>
  );
}
function Divider() {
  return <hr className="text-fg.subtle my-[4px]" />;
}

ContextMenu.Item = Item;
ContextMenu.Divider = Divider;
