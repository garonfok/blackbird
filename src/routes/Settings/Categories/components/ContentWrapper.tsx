import { Content } from "@radix-ui/react-tabs";
import { PropsWithChildren } from "react";

export function ContentWrapper(
  props: PropsWithChildren<{
    name: string;
    value: string;
  }>
) {
  const { name, value, children } = props;
  return (
    <Content value={value} className="flex flex-col gap-[14px] absolute w-full px-[32px] py-[64px]">
      <h2 className="text-3xl font-bold text-fg.0">{name}</h2>
      {children}
    </Content>
  );
}
