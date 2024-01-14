import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { Instrument } from "src/app/types";

export function SelectInstruments(props: {
  instruments: Instrument[];
  setInstruments: (instruments: Instrument[]) => void;
}) {
  const { instruments, setInstruments } = props;

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [allInstruments, setAllInstruments] = useState<Instrument[]>([]);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstruments();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function fetchInstruments() {
    const instruments = (await invoke("instruments_get_all")) as Instrument[];
    instruments.sort((a, b) => a.name.localeCompare(b.name));
    setAllInstruments(instruments);
  }

  function handleClickSelectInstrument(instrument: Instrument) {
    if (instruments.map((i) => i.id).includes(instrument.id)) {
      setInstruments(instruments.filter((i) => i.id !== instrument.id));
    } else {
      setInstruments([...instruments, instrument]);
    }
    setQuery("");
    setIsFocused(false);
  }

  function handleClickRemoveInstrument(instrumentId: number) {
    const filtered = instruments.filter(
      (instrument) => instrument.id !== instrumentId
    );
    setInstruments(filtered);
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsFocused(false);
    }
  }, []);

  const filteredInstruments = allInstruments.filter((instrument) =>
    instrument.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor="instruments">Instruments</label>
      <div ref={inputRef} className="w-full gap-[4px] flex flex-col">
        <div className="relative">
          {isFocused && (
            <div className="top-[30px] w-full overflow-y-auto max-h-72 dropdown scrollbar-default">
              {filteredInstruments.length > 0 ? (
                filteredInstruments.map((instrument) => (
                  <button
                    key={instrument.id}
                    className="dropdown-item text-left"
                    onClick={() => handleClickSelectInstrument(instrument)}
                  >
                    {instrument.name}
                    {instruments.map((i) => i.id).includes(instrument.id) && (
                      <Icon path={mdiCheck} size={1} className="float-right" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-[14px] py-[8px] text-fg.2 italic">
                  No results
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className={classNames(
            "input-text flex-wrap flex gap-[14px] transition-default",
            isFocused && "ring-1 ring-inset ring-fg.0"
          )}
        >
          {instruments.map((instrument) => (
            <span
              key={instrument.id}
              className="px-[14px] py-[8px] rounded-default flex items-center gap-[8px] bg-bg.1 w-fit"
            >
              <span>{instrument.name}</span>
              <button
                onClick={() => handleClickRemoveInstrument(instrument.id)}
              >
                <Icon path={mdiClose} size={1} className="link" />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-grow bg-transparent outline-none placeholder-fg.2"
            onChange={(event) => setQuery(event.currentTarget.value)}
            value={query}
            onFocus={() => setIsFocused(true)}
          />
        </div>
      </div>
    </div>
  );
}
