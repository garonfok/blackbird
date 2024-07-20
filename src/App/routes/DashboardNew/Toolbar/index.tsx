import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getWorkingDirectory, openFolder } from "@/invokers/lib";
import { openWizard } from "@/invokers/window";
import { CaretDown } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Toolbar() {
  const [isLoading, setIsLoading] = useState(true);
  const [directoryPath, setDirectoryPath] = useState<string | undefined>(
    undefined,
  );

  useEffect(() => {
    initialLoad();
  }, []);

  async function initialLoad() {
    async function fetchDirectoryName() {
      const workingDirectory = await getWorkingDirectory();
      setDirectoryPath(workingDirectory);
    }

    fetchDirectoryName();

    setIsLoading(false);
  }

  async function handleClickOpenFolder() {
    await openFolder({ path: directoryPath! });
  }

  async function handleClickOpenWizard() {
    await openWizard({ pieceId: undefined });
  }

  if (isLoading) {
    return <div />;
  }

  return (
    <div className="flex gap-[4px] mb-[4px]">
      <DropdownMenu>
        <DropdownMenuTrigger className="group">
          <Button
            variant="menubar"
            className="group-data-[state=open]:bg-button-secondary-bg.focus flex gap-[4px]"
          >
            <span>{directoryPath?.split("/").pop() || directoryPath}/</span>
            <CaretDown weight="bold" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onSelect={handleClickOpenFolder}>
            Open directory
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/settings" className="flex items-center gap-[8px]">
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="border-r border-divider.default" />
      <Button variant="menubar" onClick={handleClickOpenWizard}>
        New piece
      </Button>
    </div>
  );
}
