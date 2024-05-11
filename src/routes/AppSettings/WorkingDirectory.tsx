import { changeWorkingDirectory, getDatabaseExists, getDirEmpty, getWorkingDirectory } from "@/app/invokers";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/api/dialog";
import { relaunch } from "@tauri-apps/api/process";
import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { createMachine } from "xstate";
import { SettingsEntry } from "./components/SettingsEntry";

const changeDirMachine = createMachine({
  id: "changeDir",
  predictableActionArguments: true,
  initial: "idle",
  states: {
    idle: {
      on: {
        RESTART: "restarting",
        CREATE_DATABASE: "creatingDatabase",
        DATABASE_EXISTS: "canceling",
      },
    },
    restarting: {
      on: {
        FINISH: "idle",
      },
    },
    creatingDatabase: {
      on: {
        FINISH: "idle",
        RESTART: "restarting",
      },
    },
    canceling: {
      on: {
        FINISH: "idle",
      },
    },
  },
});

export function WorkingDirectory() {
  const [changeDirState, sendChangeDir] = useMachine(changeDirMachine);
  const [workingDirectory, setWorkingDirectory] = useState<string>();

  useEffect(() => {
    async function initSetting() {
      const workingDir = await getWorkingDirectory()
      setWorkingDirectory(workingDir);
    }

    initSetting();
  }, []);

  async function handleClickChangeDirectory() {
    const selectedPath = await open({
      directory: true,
    });
    if (!selectedPath) return;
    if (selectedPath === workingDirectory) return;
    const databaseExists = await getDatabaseExists({
      path: selectedPath as string,
    });
    if (databaseExists) {
      setWorkingDirectory(selectedPath as string);
      sendChangeDir("RESTART");
    } else {
      const isDirEmpty = await getDirEmpty({
        path: selectedPath as string,
      });
      if (isDirEmpty) {
        setWorkingDirectory(selectedPath as string);
        sendChangeDir("CREATE_DATABASE");
      } else {
        sendChangeDir("DATABASE_EXISTS");
      }
    }
  }

  async function handleConfirmRestart() {
    if (workingDirectory !== undefined) {
      await changeWorkingDirectory({ path: workingDirectory });
    }
    sendChangeDir("FINISH");
    await relaunch();
  }

  async function handleCancelRestart() {
    sendChangeDir("FINISH");
    const invokeGetWorkingDirectory = await getWorkingDirectory();
    setWorkingDirectory(invokeGetWorkingDirectory as string);
  }

  return (
    <>
      <SettingsEntry
        name="Working Directory"
        description={<Badge variant="outline">{workingDirectory}</Badge> || "Loading..."}
      >
        <Button variant="secondary" onClick={handleClickChangeDirectory}>
          Change Working Directory
        </Button>
      </SettingsEntry>
      <AlertDialog open={changeDirState.matches("canceling")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Could not change working directory</AlertDialogTitle>
            <AlertDialogDescription>The selected directory is not empty.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={() => sendChangeDir("FINISH")}>Okay</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={changeDirState.matches("restarting")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restart Blackbird to save changes</AlertDialogTitle>
            <AlertDialogDescription>You must restart Blackbird to load the selected directory.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRestart}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={handleConfirmRestart}>Restart Blackbird</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={changeDirState.matches("creatingDatabase")}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>No library was found at this location</AlertDialogTitle>
            <AlertDialogDescription>Would you like to create a library here?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelRestart}>No</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => sendChangeDir("RESTART")}>Yes</Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
