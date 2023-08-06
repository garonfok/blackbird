import { open } from "@tauri-apps/api/dialog";
import { relaunch } from "@tauri-apps/api/process";
import { invoke } from "@tauri-apps/api/tauri";
import { useMachine } from "@xstate/react";
import { useEffect, useState } from "react";
import { createMachine } from "xstate";
import { Modal } from "../../components/Modal";
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
        description={workingDirectory || "Loading..."}
      >
        <button
          className="border px-[14px] py-[8px] rounded-[4px] hover:bg-fg.default hover:text-bg.inset transition-all"
          onClick={handleClickChangeDirectory}
        >
          Change Working Directory
        </button>
      </SettingsEntry>

      <Modal
        title="Could not change working directory."
        isOpen={changeDirState.matches("canceling")}
        confirmText="Okay"
        closeModal={() => sendChangeDir("FINISH")}
        onConfirm={() => sendChangeDir("FINISH")}
      >
        The selected directory is not empty.
      </Modal>

      <Modal
        title="Restart Blackbird to save changes."
        isOpen={changeDirState.matches("restarting")}
        confirmText="Restart Blackbird"
        cancelText="Cancel"
        closeModal={handleCancelRestart}
        onConfirm={handleConfirmRestart}
      >
        You must restart Blackbird to load the selected directory.
      </Modal>

      <Modal
        title="No library was found at this location."
        isOpen={changeDirState.matches("creatingDatabase")}
        confirmText="Yes"
        cancelText="No"
        closeModal={handleCancelRestart}
        onConfirm={() => sendChangeDir("RESTART")}
      >
        Would you like to create a library here?
      </Modal>
    </>
  );
}
