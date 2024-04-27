import { Button } from "@/components/ui/button";
import { useCmdOrCtrlHotkey } from "@/hooks/useHotkey";
import { mdiHomeOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { Link, useNavigate } from "react-router-dom";
import { OpenOnStartup } from "./OpenOnStartup";
import { WorkingDirectory } from "./WorkingDirectory";
export function Settings() {
  const navigate = useNavigate();
  useCmdOrCtrlHotkey("Escape", () => navigate("/"));

  return (
    <>
      <div className="justify-center flex">
        <div className="w-[768px] flex flex-col gap-[14px] p-[14px]">
          <span className="flex justify-between items-center">
            <h1 className="text-heading-default">Settings</h1>
            <Button variant="main" asChild>
              <Link to="/" className="flex items-center gap-[8px]">
                <Icon path={mdiHomeOutline} size={1} />
                <span>Home</span>
              </Link>
            </Button>
          </span>
          <hr className="text-divider.default" />
          <div className="flex flex-col gap-[14px]">
            <WorkingDirectory />
            <OpenOnStartup />
          </div>
        </div>
      </div>
    </>
  );
}
