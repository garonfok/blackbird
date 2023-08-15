import { mdiFloppy, mdiPlus, mdiTextBoxPlusOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useMachine } from "@xstate/react";
import { useCallback, useState } from "react";
import { createMachine } from "xstate";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { EditPart, Ensemble, Instrument } from "../../../../../app/types";
import { Modal } from "../../../../../components/Modal";
import { formatPartNumbers, pushPart, setParts } from "../../../pieceSlice";
import { LoadEnsembleModal } from "./LoadEnsembleModal";
import { PartsList } from "./PartsList";
import { SelectInstrumentModal } from "./SelectInstrumentModal";
import { SaveEnsembleModal } from "../../../../../components/SaveEnsembleModal";

const loadEnsembleMachine = createMachine({
  id: "loadEnsemble",
  predictableActionArguments: true,
  initial: "idle",
  states: {
    idle: {
      on: {
        SELECT: "selecting",
      },
    },
    selecting: {
      on: {
        CONFIRM: "confirming",
        CANCEL: "idle",
      },
    },
    confirming: {
      on: {
        FINISH: "idle",
      },
    },
  },
});

export function Parts() {
  const [isSelectInstrumentModalOpen, setIsSelectInstrumentModalOpen] =
    useState(false);
  const [isSaveEnsembleModalOpen, setIsSaveEnsembleModalOpen] = useState(false);
  const [ensembleIdToLoad, setEnsembleIdToLoad] = useState<number | null>(null);

  const [loadEnsembleState, sendLoadEnsemble] = useMachine(loadEnsembleMachine);

  const dispatch = useAppDispatch();
  const piece = useAppSelector((state) => state.piece);

  const handleConfirmSelectInstrument = useCallback(
    async (instrumentId: number) => {
      const instrument = (await invoke("instruments_get_by_id", {
        id: instrumentId,
      })) as Instrument;

      const maxPartId = Math.max(...piece.parts.map((part) => part.id ?? 0));
      dispatch(
        pushPart({
          id: maxPartId + 1,
          show: false,
          name: instrument.name,
          instruments: [instrument],
        })
      );
      dispatch(formatPartNumbers());
    },
    []
  );

  const handleConfirmSaveEnsemble = useCallback(async () => {}, [piece.parts]);

  const handleConfirmConfirmEnsemble = useCallback(async () => {
    const ensemble = (await invoke("ensembles_get_by_id", {
      id: ensembleIdToLoad,
    })) as Ensemble;

    const { parts } = ensemble;
    const partsToAdd: EditPart[] = [];
    let counter = 1;
    for (const part of parts!) {
      partsToAdd.push({
        id: counter++,
        show: false,
        name: part.name,
        instruments: part.instruments,
      });
    }
    dispatch(setParts(partsToAdd));
    setEnsembleIdToLoad(null);
    sendLoadEnsemble("FINISH");
  }, [ensembleIdToLoad]);

  const handleConfirmLoadEnsemble = useCallback(
    async (ensembleId: number) => {
      setEnsembleIdToLoad(ensembleId);
      sendLoadEnsemble("CONFIRM");
    },
    [ensembleIdToLoad]
  );

  const handleCloseConfirmEnsemble = useCallback(() => {
    setEnsembleIdToLoad(null);
    sendLoadEnsemble("CANCEL");
  }, []);

  return (
    <>
      <div className="edit-wizard-panel overflow-hidden">
        <PartsList />
        <button
          onClick={() => setIsSelectInstrumentModalOpen(true)}
          className="text-left text-fg.muted hover:text-fg.default transition-all flex gap-[4px] items-center w-fit"
        >
          <Icon path={mdiPlus} size={1} />
          Add part
        </button>
        <button
          onClick={() => setIsSaveEnsembleModalOpen(true)}
          className="text-left text-fg.muted hover:text-fg.default transition-all flex gap-[4px] items-center w-fit"
        >
          <Icon path={mdiFloppy} size={1} />
          Save as template ensemble
        </button>
        <button
          onClick={() => sendLoadEnsemble("SELECT")}
          className="text-left text-fg.muted hover:text-fg.default transition-all flex gap-[4px] items-center w-fit"
        >
          <Icon path={mdiTextBoxPlusOutline} size={1} />
          Load ensemble
        </button>
      </div>
      <SelectInstrumentModal
        closeModal={() => setIsSelectInstrumentModalOpen(false)}
        isOpen={isSelectInstrumentModalOpen}
        onConfirm={handleConfirmSelectInstrument}
      />
      <SaveEnsembleModal
        closeModal={() => setIsSaveEnsembleModalOpen(false)}
        isOpen={isSaveEnsembleModalOpen}
        onConfirm={handleConfirmSaveEnsemble}
      />
      <LoadEnsembleModal
        closeModal={() => sendLoadEnsemble("CANCEL")}
        isOpen={loadEnsembleState.matches("selecting")}
        onConfirm={handleConfirmLoadEnsemble}
      />
      <Modal
        isOpen={loadEnsembleState.matches("confirming")}
        closeModal={handleCloseConfirmEnsemble}
        title="Override ensemble?"
        onConfirm={handleConfirmConfirmEnsemble}
        confirmText="Yes"
        cancelText="Cancel"
      >
        This will overwrite all currently entered parts.
      </Modal>
    </>
  );
}
