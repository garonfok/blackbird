import { useEffect, useState } from "react";
import { SettingsEntry } from "./components/SettingsEntry";
import { Toggle } from "../../components/Toggle";
import { enable, isEnabled, disable } from "tauri-plugin-autostart-api";

export function OpenOnStartup() {
  const [doesAppOpenOnStartup, setDoesAppOpenOnStartup] =
    useState<boolean>(false);
  useEffect(() => {
    async function initSetting() {
      const isStartupEnabled = await isEnabled();
      console.log(isStartupEnabled);
      setDoesAppOpenOnStartup(isStartupEnabled);
    }
    initSetting();
  }, []);

  async function toggleStartup() {
    if (doesAppOpenOnStartup) {
      await disable();
    } else {
      await enable();
    }
    setDoesAppOpenOnStartup(!doesAppOpenOnStartup);
  }

  return (
    <SettingsEntry
      name="Open On Startup"
      description={"Open Blackbird automatically when you log in."}
    >
      <Toggle
        enabled={doesAppOpenOnStartup as boolean}
        setEnabled={toggleStartup}
      />
    </SettingsEntry>
  );
}
