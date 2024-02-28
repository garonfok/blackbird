import { Listbox } from "@headlessui/react";
import { mdiChevronDown, mdiEraser } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Instrument, Musician } from "@/app/types";
import { setFilterExclTag } from "../../../reducers/filterSlice";
import { SelectInstruments } from "./SelectInstruments";
import { SelectMusicians } from "./SelectMusicians";

const MAX_DIFFICULTY = 6;

export function AdvancedFilters(props: { onClose: () => void }) {
  const { onClose } = props;

  const [yearPublishedMin, setYearPublishedMin] = useState<number>();
  const [yearPublishedMax, setYearPublishedMax] = useState<number>();
  const [difficultyMin, setDifficultyMin] = useState<number>();
  const [difficultyMax, setDifficultyMax] = useState<number>();
  const [parts, setParts] = useState<string[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [composers, setComposers] = useState<Musician[]>([]);
  const [arrangers, setArrangers] = useState<Musician[]>([]);
  const [orchestrators, setOrchestrators] = useState<Musician[]>([]);
  const [transcribers, setTranscribers] = useState<Musician[]>([]);
  const [lyricists, setLyricists] = useState<Musician[]>([]);

  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.filter);

  useEffect(() => {
    setYearPublishedMin(
      filter.yearPublishedMin !== 0 ? filter.yearPublishedMin : undefined
    );
    setYearPublishedMax(
      filter.yearPublishedMax !== Infinity ? filter.yearPublishedMax : undefined
    );
    setDifficultyMin(
      filter.difficultyMin !== 0 ? filter.difficultyMin : undefined
    );
    setDifficultyMax(
      filter.difficultyMax !== Infinity ? filter.difficultyMax : undefined
    );
    setParts(filter.parts);
    setInstruments(filter.instruments);
    setComposers(filter.composers);
    setArrangers(filter.arrangers);
    setOrchestrators(filter.orchestrators);
    setTranscribers(filter.transcribers);
    setLyricists(filter.lyricists);
  }, [filter]);

  function handleClickClearFilters() {
    setYearPublishedMin(undefined);
    setYearPublishedMax(undefined);
    setDifficultyMin(undefined);
    setDifficultyMax(undefined);
    setParts([]);
    setInstruments([]);
    setComposers([]);
    setArrangers([]);
    setOrchestrators([]);
    setTranscribers([]);
    setLyricists([]);
  }

  function handleChangeYearPublishedMin(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.currentTarget.value === "") {
      setYearPublishedMin(undefined);
      return;
    }
    const yearPublished = parseInt(event.currentTarget.value);
    if (isNaN(yearPublished)) return;
    setYearPublishedMin(yearPublished);
  }
  function handleChangeYearPublishedMax(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (event.currentTarget.value === "") {
      setYearPublishedMax(undefined);
      return;
    }
    const yearPublished = parseInt(event.currentTarget.value);
    if (isNaN(yearPublished)) return;
    setYearPublishedMax(yearPublished);
  }

  function handleClickApplyFilters() {
    let yMin = yearPublishedMin ?? 0;
    let yMax = yearPublishedMax ?? Infinity;
    if (yearPublishedMin! > yearPublishedMax!) {
      [yMin, yMax] = [yearPublishedMax as number, yearPublishedMin as number];
    }

    let dMin = difficultyMin ?? 0;
    let dMax = difficultyMax ?? Infinity;
    if (difficultyMin! > difficultyMax!) {
      [dMin, dMax] = [difficultyMax as number, yearPublishedMin as number];
    }

    dispatch(
      setFilterExclTag({
        yearPublishedMin: yMin,
        yearPublishedMax: yMax,
        difficultyMin: dMin,
        difficultyMax: dMax,
        parts,
        instruments,
        composers,
        arrangers,
        orchestrators,
        transcribers,
        lyricists,
      })
    );

    onClose();
  }

  return (
    <div className="dropdown w-full p-[14px] gap-[14px]">
      <div className="flex flex-col overflow-y-auto max-h-96 scrollbar-default gap-[14px]">
        {/* Year published */}
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="yearPublished">Year published</label>
          <div className="grid grid-cols-2 gap-[14px]">
            <div className="w-full flex items-center gap-[4px]">
              <span className="text-body-small-default">From:</span>
              <input
                id="yearPublished"
                type="number"
                className="input-text [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                max={9999}
                value={yearPublishedMin}
                onInput={(event) =>
                  (event.currentTarget.value = event.currentTarget.value.slice(
                    0,
                    4
                  ))
                }
                onChange={handleChangeYearPublishedMin}
              />
            </div>
            <div className="w-full flex items-center gap-[4px]">
              <span className="text-body-small-default">To:</span>
              <input
                id="yearPublished"
                type="number"
                className="input-text [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                max={9999}
                value={yearPublishedMax}
                onInput={(event) =>
                  (event.currentTarget.value = event.currentTarget.value.slice(
                    0,
                    4
                  ))
                }
                onChange={handleChangeYearPublishedMax}
              />
            </div>
          </div>
        </div>
        {/* Difficulty */}
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="difficulty">Difficulty</label>
          <div className="grid grid-cols-2 gap-[14px]">
            <div className="w-full flex items-center gap-[4px]">
              <span className="text-body-small-default">From:</span>
              <Listbox value={difficultyMin} onChange={setDifficultyMin}>
                {({ open }) => (
                  <div className="relative w-full">
                    <Listbox.Button className="input-text flex justify-between w-full">
                      <span>{difficultyMin}</span>
                      <Icon
                        path={mdiChevronDown}
                        size={1}
                        className={classNames(
                          "transition-default",
                          open && "rotate-180"
                        )}
                      />
                    </Listbox.Button>
                    <Listbox.Options className="dropdown w-full">
                      <Listbox.Option
                        value={undefined}
                        className={({ active }) =>
                          classNames(
                            "dropdown-item italic",
                            active && "bg-bg.2 text-fg.0"
                          )
                        }
                      >
                        None
                      </Listbox.Option>
                      {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
                        <Listbox.Option
                          key={i}
                          value={i + 1}
                          className={({ active }) =>
                            classNames(
                              "dropdown-item",
                              active && "bg-bg.2 text-fg.0"
                            )
                          }
                        >
                          {i + 1}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                )}
              </Listbox>
            </div>
            <div className="w-full flex items-center gap-[4px]">
              <span className="text-body-small-default">To:</span>
              <Listbox value={difficultyMax} onChange={setDifficultyMax}>
                {({ open }) => (
                  <div className="relative w-full">
                    <Listbox.Button className="input-text flex justify-between w-full">
                      <span>{difficultyMax}</span>
                      <Icon
                        path={mdiChevronDown}
                        size={1}
                        className={classNames(
                          "transition-default",
                          open && "rotate-180"
                        )}
                      />
                    </Listbox.Button>
                    <Listbox.Options className="dropdown w-full">
                      <Listbox.Option
                        value={undefined}
                        className={({ active }) =>
                          classNames(
                            "dropdown-item italic",
                            active && "bg-bg.2 text-fg.0"
                          )
                        }
                      >
                        None
                      </Listbox.Option>
                      {Array.from({ length: MAX_DIFFICULTY }, (_, i) => (
                        <Listbox.Option
                          key={i}
                          value={i + 1}
                          className={({ active }) =>
                            classNames(
                              "dropdown-item",
                              active && "bg-bg.2 text-fg.0"
                            )
                          }
                        >
                          {i + 1}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                )}
              </Listbox>
            </div>
          </div>
        </div>
        {/* Parts */}
        <div className="flex flex-col gap-[8px]">
          <label htmlFor="parts">
            Parts
          </label>
          <input
            id="parts"
            type="text"
            className="input-text"
            placeholder="Separate with commas e.g. Flute, Clarinet, Piano"
            value={parts.join(", ")}
            onChange={(event) =>
              setParts(event.currentTarget.value.split(", "))
            }
          />
        </div>
        {/* Instruments */}
        <SelectInstruments
          instruments={instruments}
          setInstruments={setInstruments}
        />
        <SelectMusicians
          musicians={composers}
          setMusicians={setComposers}
          role="composers"
        />
        <SelectMusicians
          musicians={arrangers}
          setMusicians={setArrangers}
          role="arrangers"
        />
        <SelectMusicians
          musicians={orchestrators}
          setMusicians={setOrchestrators}
          role="orchestrators"
        />
        <SelectMusicians
          musicians={transcribers}
          setMusicians={setTranscribers}
          role="transcribers"
        />
        <SelectMusicians
          musicians={lyricists}
          setMusicians={setLyricists}
          role="lyricists"
        />
      </div>
      <hr className="text-divider" />
      <div className="flex gap-[14px]">
        <button
          onClick={handleClickClearFilters}
          className="link"
        >
          <Icon path={mdiEraser} size={1} className="shrink-0" />
        </button>
        <button
          onClick={handleClickApplyFilters}
          className="button-primary"
        >
          Apply filters
        </button>
        <button
          onClick={onClose}
          className="link"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
