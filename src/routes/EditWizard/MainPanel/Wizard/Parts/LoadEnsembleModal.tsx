import { Tab } from "@headlessui/react";
import { invoke } from "@tauri-apps/api";
import classNames from "classnames";
import { useCallback, useEffect, useRef, useState } from "react";
import { Ensemble } from "@/app/types";
import { Modal } from "@/components/Modal";

interface GroupedEnsembles {
  [key: string]: Ensemble[];
}

export function LoadEnsembleModal(props: {
  isOpen: boolean;
  closeModal: () => void;
  onConfirm: (ensembleId: number) => void;
}) {
  const { isOpen, closeModal, onConfirm } = props;

  const [tabIndex, setTabIndex] = useState(-1);
  const [groupedEnsembles, setGroupedEnsembles] = useState<GroupedEnsembles>(
    {}
  );

  const tabRef = useRef<HTMLDivElement>(null);
  const tabPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEnsembles();

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  function handleClickSubmit(ensembleId: number) {
    onConfirm(ensembleId);
    closeModal();
  }

  async function fetchEnsembles() {
    const ensembles = (await invoke("ensembles_get_all")) as Ensemble[];
    const groupedEnsembles = ensembles.reduce((acc, ensemble) => {
      const category = ensemble.category || "Uncategorized";
      acc[category] = [...(acc[category] || []), ensemble];
      return acc;
    }, {} as GroupedEnsembles);
    setGroupedEnsembles(groupedEnsembles);
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
      title="Load template ensemble"
    >
      <Tab.Group vertical onChange={setTabIndex} selectedIndex={tabIndex}>
        <div className="flex gap-[4px] h-64">
          <Tab.List className="flex flex-col px-[14px] py-[8px] rounded-default bg-bg.2">
            {Object.keys(groupedEnsembles).map((category, index) => (
              <Tab
                key={category}
                className={classNames(
                  "text-left outline-none transition-default",
                  index === tabIndex
                    ? "text-fg.0"
                    : "text-fg.1 hover:text-fg.0"
                )}
              >
                {category}
              </Tab>
            ))}
            <Tab />
          </Tab.List>
          <div ref={tabPanelRef} className="w-full h-full">
            <Tab.Panels className="flex flex-col px-[14px] py-[8px] rounded-default h-full bg-bg.2 w-full">
              {Object.keys(groupedEnsembles).map((category, index) => (
                <Tab.Panel
                  key={index}
                  className={classNames(
                    "flex flex-col overflow-y-auto scrollbar-default"
                  )}
                >
                  {groupedEnsembles[category].map((groupedEnsemble) => (
                    <button
                      key={groupedEnsemble.id}
                      className="text-left link"
                      onClick={() => handleClickSubmit(groupedEnsemble.id)}
                    >
                      {groupedEnsemble.name}
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
