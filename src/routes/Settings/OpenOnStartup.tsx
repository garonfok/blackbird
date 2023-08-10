import { useEffect, useState } from "react";
import { disable, enable, isEnabled } from "tauri-plugin-autostart-api";
import { Toggle } from "../../components/Toggle";
import { SettingsEntry } from "./components/SettingsEntry";

export function OpenOnStartup() {
  const [doesAppOpenOnStartup, setDoesAppOpenOnStartup] =
    useState<boolean>(false);
  useEffect(() => {
    async function initSetting() {
      const isStartupEnabled = await isEnabled();
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
