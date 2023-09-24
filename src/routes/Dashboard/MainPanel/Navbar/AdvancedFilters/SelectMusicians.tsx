import { mdiCheck, mdiClose } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { Musician } from "src/app/types";

export function SelectMusicians(props: {
  musicians: Musician[];
  setMusicians: (musicians: Musician[]) => void;
  role:
    | "composers"
    | "arrangers"
    | "orchestrators"
    | "transcribers"
    | "lyricists";
}) {
  const { musicians, setMusicians, role } = props;

  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [allMusicians, setAllMusicians] = useState<Musician[]>([]);

  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMusicians();
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function fetchMusicians() {
    const musicians = (await invoke("musicians_get_all")) as Musician[];
    musicians.sort((a, b) => {
      const aLastName = a.last_name ?? "";
      const bLastName = b.last_name ?? "";
      const lastNameComparison = aLastName.localeCompare(bLastName);
      if (lastNameComparison !== 0) return lastNameComparison;
      return a.first_name.localeCompare(b.first_name);
    });

    setAllMusicians(musicians);
  }

  function handleClickSelectMusician(musician: Musician) {
    if (musicians.map((i) => i.id).includes(musician.id)) {
      setMusicians(musicians.filter((i) => i.id !== musician.id));
    } else {
      setMusicians([...musicians, musician]);
    }
    setQuery("");
    setIsFocused(false);
  }

  function handleClickRemoveMusician(instrumentId: number) {
    const filtered = musicians.filter(
      (musician) => musician.id !== instrumentId
    );
    setMusicians(filtered);
  }

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      setIsFocused(false);
    }
  }, []);

  const filteredMusicians = allMusicians.filter((musician) => {
    const fullName = [musician.first_name, musician.last_name].join(" ");
    return fullName.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="flex flex-col gap-[8px]">
      <label htmlFor="musicians" className="text-fg.default">
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </label>
      <div ref={inputRef} className="w-full gap-[4px] flex flex-col">
        <div className="relative">
          {isFocused && (
            <div className="absolute left-0 bottom-[14px] rounded-[4px] bg-bg.inset w-full z-10 overflow-y-auto max-h-72 scrollbar-default border border-fg.subtle">
              {filteredMusicians.length > 0 ? (
                <div className="flex flex-col rounded-[4px] border-bg.inset border overflow-clip">
                  {filteredMusicians.map((musician) => (
                    <button
                      key={musician.id}
                      className="dropdown-item text-left"
                      onClick={() => handleClickSelectMusician(musician)}
                    >
                      {musician.first_name} {musician.last_name}
                      {musicians.map((i) => i.id).includes(musician.id) && (
                        <Icon
                          path={mdiCheck}
                          size={1}
                          className="float-right"
                        />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-[14px] py-[8px] text-fg.subtle">
                  No results
                </div>
              )}
            </div>
          )}
        </div>
        <div
          className={classNames(
            "input-text flex-wrap flex gap-[14px] transition-all",
            isFocused && "ring-1 ring-inset ring-fg.default"
          )}
        >
          {musicians.map((musician) => (
            <span
              key={musician.id}
              className="px-[14px] py-[8px] rounded-[4px] flex items-center gap-[8px] bg-bg.default w-fit shadow-float"
            >
              <span>
                {musician.first_name} {musician.last_name}
              </span>
              <button onClick={() => handleClickRemoveMusician(musician.id)}>
                <Icon
                  path={mdiClose}
                  size={1}
                  className="text-fg.muted hover:text-fg.default transition-all"
                />
              </button>
            </span>
          ))}
          <input
            type="text"
            className="flex-grow bg-transparent outline-none placeholder-fg.subtle"
            onChange={(event) => setQuery(event.currentTarget.value)}
            value={query}
            onFocus={() => setIsFocused(true)}
          />
        </div>
      </div>
    </div>
  );
}
