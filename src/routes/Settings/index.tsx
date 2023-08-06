import { mdiHomeOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Link } from "react-router-dom";
import { OpenOnStartup } from "./OpenOnStartup";
import { WorkingDirectory } from "./WorkingDirectory";
export function Settings() {
  return (
    <>
      <div className="justify-center flex">
        <div className="w-[768px] flex flex-col gap-[14px] p-[14px]">
          <span className="flex justify-between items-center">
            <h1 className="text-[28px]">Settings</h1>
            <Link
              to="/"
              className="flex gap-[8px] items-center text-fg.muted hover:text-fg.default"
            >
              <Icon path={mdiHomeOutline} size={1} />
              <span className="text-[16px]">Home</span>
            </Link>
          </span>
          <hr className="text-fg.subtle" />
          <div className="flex flex-col gap-[14px]">
            <WorkingDirectory />
            <OpenOnStartup />
          </div>
        </div>
      </div>
    </>
  );
}
