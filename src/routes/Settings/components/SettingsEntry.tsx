import { PropsWithChildren } from "react";

export function SettingsEntry(
  props: PropsWithChildren<{
    name: string;
    description: string;
  }>
) {
  const { name, description, children } = props;
  return (
    <div className="flex flex-col gap-[4px]">
      <h2 className="text-heading-default">{name}</h2>
      <div className="flex justify-between items-center">
        <span className="text-body-default">{description}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}
