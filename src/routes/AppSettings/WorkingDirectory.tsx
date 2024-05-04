import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/api/dialog";
import { relaunch } from "@tauri-apps/api/process";
import { invoke } from "@tauri-apps/api/tauri";
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
      const invokeGetWorkingDirectory = await invoke("get_working_directory");
      setWorkingDirectory(invokeGetWorkingDirectory as string);
    }

    initSetting();
  }, []);

  async function handleClickChangeDirectory() {
    const selectedPath = await open({
      directory: true,
    });
    if (!selectedPath) return;
    if (selectedPath === workingDirectory) return;
    const databaseExists = await invoke("get_database_exists", {
      path: selectedPath,
    });
    if (databaseExists) {
      setWorkingDirectory(selectedPath as string);
      sendChangeDir("RESTART");
    } else {
      const isDirEmpty = await invoke("get_dir_empty", {
        path: selectedPath,
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
    await invoke("set_working_directory", {
      path: workingDirectory,
    });
    sendChangeDir("FINISH");
    await relaunch();
  }

  async function handleCancelRestart() {
    sendChangeDir("FINISH");
    const invokeGetWorkingDirectory = await invoke("get_working_directory");
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
