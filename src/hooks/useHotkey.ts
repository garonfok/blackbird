import { os } from "@tauri-apps/api";
import { useEffect, useState } from "react";

export function useHotkey(key: string, callback: () => void) {

  const [osType, setOsType] = useState<string>("Windows NT");

  useEffect(() => {
    const getOsType = async () => {
      setOsType(await os.type());
    }
    getOsType();
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", (event) => {
      if (event.key === key && (osType === "Windows NT" ? event.ctrlKey : event.metaKey)) {
        callback();
      }
    });

    return () => {
      document.removeEventListener("keydown", (event) => {
        if (event.key === key) {
          callback();
        }
      });
    };

  }, [key, callback]);
}
