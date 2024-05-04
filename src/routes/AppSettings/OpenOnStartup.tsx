import { useEffect, useState } from "react";
import { disable, enable, isEnabled } from "tauri-plugin-autostart-api";
import { SettingsEntry } from "./components/SettingsEntry";
import { Switch } from "@/components/ui/switch";

export function OpenOnStartup() {
  const [checked, setChecked] =
    useState(false);

  useEffect(() => {
    async function initSetting() {
      const isStartupEnabled = await isEnabled();
      setChecked(isStartupEnabled);
    }
    initSetting();
  }, []);

  useEffect(() => {
    async function updateSetting() {
      if (checked) {
        await enable();
      } else {
        await disable();
      }
    }
    updateSetting();
  }, [checked])

  return (
    <SettingsEntry
      name="Open On Startup"
      description={"Open Blackbird automatically when you log in."}
    >
      <Switch checked={checked} onCheckedChange={setChecked} />
    </SettingsEntry>
  );
}
