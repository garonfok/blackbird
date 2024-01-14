import { Switch } from "@headlessui/react";
import classNames from "classnames";

export function Toggle(props: { enabled: boolean; setEnabled: () => void }) {
  const { enabled, setEnabled } = props;
  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      className={classNames(
        enabled ? "bg-primary.default" : "bg-bg.2",
        " focus-visible:ring-fg.0 items-center relative inline-flex h-[33px] w-[58px] shrink-0 cursor-pointer rounded-full transition-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75"
      )}
    >
      <span
        aria-hidden="true"
        className={`${enabled ? "translate-x-[27px]" : "translate-x-[2px]"}
    pointer-events-none inline-block h-[29px] w-[29px] transform rounded-full bg-fg.0 ring-0 transition-default`}
      />
    </Switch>
  );
}
