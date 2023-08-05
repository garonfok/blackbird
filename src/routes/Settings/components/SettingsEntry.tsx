import { ReactNode } from "react";

export function SettingsEntry(props: {
  name: string;
  description: string;
  children?: ReactNode;
}) {
  const { name, description, children } = props;
  return (
    <div className="flex flex-col gap-[14px]">
      <h2 className="text-[20px]">{name}</h2>
      <div className="flex justify-between items-center">
        <span className="text-fg.muted">{description}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}
