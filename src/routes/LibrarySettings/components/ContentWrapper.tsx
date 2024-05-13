import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mdiHomeOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Content } from "@radix-ui/react-tabs";
import { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

export function ContentWrapper(
  props: PropsWithChildren<{
    name: string;
    value: string;
  }>
) {
  const { name, value, children } = props;
  return (
    <Content value={value} className="flex flex-col gap-[8px] absolute w-full">
      <span className="w-full justify-between items-center flex">
        <h2 className="text-heading-default">{name}</h2>
        <Button variant="main" asChild>
          <Link to="/" className="flex items-center gap-[8px]">
            <Icon path={mdiHomeOutline} size={1} />
            <span>Home</span>
          </Link>
        </Button>
      </span>
      {children}
    </Content>
  );
}
