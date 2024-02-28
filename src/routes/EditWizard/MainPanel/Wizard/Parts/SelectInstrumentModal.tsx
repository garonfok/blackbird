import { Tab } from "@headlessui/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { Instrument } from "@/app/types";
import { Modal } from "@/components/Modal";

interface GroupedInstruments {
  [key: string]: Instrument[];
}

export function SelectInstrumentModal(props: {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: (instrumentId: number) => void;
}) {
  const { isOpen, closeModal, onConfirm } = props;

  const [tabIndex, setTabIndex] = useState(-1);
  const [groupedInstruments, setGroupedInstruments] =
    useState<GroupedInstruments>({});

  const tabRef = useRef<HTMLDivElement>(null);
  const tabPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInstruments();

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  function handleClickSubmit(instrumentId: number) {
    onConfirm(instrumentId);
    closeModal();
  }

  async function fetchInstruments() {
    const instruments = (await invoke("instruments_get_all")) as Instrument[];
    const groupedInstruments = instruments.reduce((acc, instrument) => {
      if (instrument.category === undefined) {
        acc["Other"] = [...(acc["Other"] || []), instrument];
        return acc;
      } else {
        acc[instrument.category] = [
          ...(acc[instrument.category] || []),
          instrument,
        ];
        return acc;
      }
    }, {} as GroupedInstruments);
    setGroupedInstruments(groupedInstruments);
  }

  function handleMouseDown(event: MouseEvent) {
    if (
      !tabRef.current?.contains(event.target as Node) &&
      !tabPanelRef.current?.contains(event.target as Node)
    ) {
      setTabIndex(-1);
    }
  }

  const handleClose = useCallback(() => {
    closeModal();
  }, []);

  return (
    <Modal
      isOpen={isOpen}
      closeModal={handleClose}
      onConfirm={onConfirm}
      title="Select instrument"
    >
      <Tab.Group vertical onChange={setTabIndex} selectedIndex={tabIndex}>
        <div className="flex gap-[4px] h-64">
          <Tab.List className="flex flex-col px-[14px] py-[8px] rounded-default bg-bg.2">
            {Object.keys(groupedInstruments).map((category, index) => (
              <Tab
                key={category}
                className={classNames(
                  "text-left outline-none transition-default",
                  index === tabIndex ? "text-fg.0" : "text-fg.1 hover:text-fg.0"
                )}
              >
                {category}
              </Tab>
            ))}
            <Tab />
          </Tab.List>
          <div ref={tabPanelRef} className="w-full h-full">
            <Tab.Panels className="flex flex-col px-[14px] py-[8px] rounded-default h-full bg-bg.2 w-full">
              {Object.keys(groupedInstruments).map((category, index) => (
                <Tab.Panel
                  key={index}
                  className={classNames(
                    "flex flex-col overflow-y-auto scrollbar-default"
                  )}
                >
                  {groupedInstruments[category].map((groupedInstrument) => (
                    <button
                      key={groupedInstrument.id}
                      className="text-left link"
                      onClick={() => handleClickSubmit(groupedInstrument.id)}
                    >
                      {groupedInstrument.name}
                    </button>
                  ))}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </div>
        </div>
      </Tab.Group>
    </Modal>
  );
}
