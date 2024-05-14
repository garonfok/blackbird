import { PropsWithChildren, ReactNode } from "react";

export function SettingsEntry(
  props: PropsWithChildren<{
    name: string;
    description: ReactNode;
  }>
) {
  const { name, description, children } = props;
  return (
    <div className="flex flex-col gap-[4px]">
      <h2 className="text-fg.0 font-bold">{name}</h2>
      <div className="flex justify-between items-center">
        <span className="text-body-default">{description}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}
