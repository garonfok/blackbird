import { Listbox } from "@headlessui/react";
import { mdiChevronDown } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ByteFile } from "@/app/types";
import { setPartFile, setScoreFile } from "../../../pieceSlice";

export function Files() {
  const files = useAppSelector((state) => state.files);
  const piece = useAppSelector((state) => state.piece.present);
  const dispatch = useAppDispatch();

  function handleChangeScoreSetFile(index: number, file: ByteFile | null) {
    dispatch(setScoreFile({ scoreIndex: index, file: file as ByteFile }));
  }

  function handleChangePartSetFile(index: number, file: ByteFile | null) {
    dispatch(setPartFile({ partIndex: index, file: file as ByteFile }));
  }

  return (
    <div className="edit-wizard-panel">
      <div className="flex flex-col gap-[14px]">
        <div className="flex flex-col">
          {piece.scores.map((score, index) => (
            <div key={score.id} className="flex flex-col gap-[8px]">
              <div>{score.name}</div>
              <Listbox
                value={score.file}
                onChange={(file) => handleChangeScoreSetFile(index, file)}
              >
                {({ open }) => (
                  <div className="gap-[8px] flex flex-col">
                    <Listbox.Button className="input-text flex justify-between">
                      <span className="text-left">{score.file?.name}</span>
                      <Icon
                        path={mdiChevronDown}
                        size={1}
                        className={classNames(
                          "transition-default",
                          open && "rotate-180"
                        )}
                      />
                    </Listbox.Button>
                    <div className="relative">
                      <Listbox.Options className="dropdown w-full overflow-y-auto max-h-72 scrollbar-default">
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
                        {files.map((file) => (
                          <Listbox.Option
                            key={file.id}
                            value={file}
                            className="dropdown-item rounded-default text-fg.1"
                          >
                            {file.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </div>
                )}
              </Listbox>
            </div>
          ))}
        </div>
        <hr className="text-divider" />
        <div className="flex flex-col">
          {piece.parts.map((part, index) => (
            <div key={part.id} className="flex flex-col gap-[8px]">
              <div>{part.name}</div>
              <Listbox
                value={part.file}
                onChange={(file) => handleChangePartSetFile(index, file)}
              >
                {({ open }) => (
                  <div className="gap-[8px] flex flex-col">
                    <Listbox.Button className="input-text flex justify-between">
                      <span>{part.file?.name}</span>
                      <Icon
                        path={mdiChevronDown}
                        size={1}
                        className={classNames(
                          "transition-default",
                          open && "rotate-180"
                        )}
                      />
                    </Listbox.Button>
                    <div className="relative">
                      <Listbox.Options className="dropdown w-full overflow-y-auto max-h-72 scrollbar-default">
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
                        {files.map((file) => (
                          <Listbox.Option
                            key={file.id}
                            value={file}
                            className="dropdown-item rounded-default text-fg.1"
                          >
                            {file.name}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </div>
                )}
              </Listbox>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
