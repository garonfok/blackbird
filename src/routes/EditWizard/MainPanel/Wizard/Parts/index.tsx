import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { EditPart, Ensemble, Instrument } from "@/app/types";
import { Modal } from "@/components/Modal";
import { SaveEnsembleModal } from "@/components/SaveEnsembleModal";
import { mdiFloppy, mdiTextBoxPlusOutline } from "@mdi/js";
import Icon from "@mdi/react";
import { invoke } from "@tauri-apps/api";
import { useMachine } from "@xstate/react";
import { useCallback, useState } from "react";
import { createMachine } from "xstate";
import { formatPartNumbers, pushPart, setParts } from "../../../pieceSlice";
import { LoadEnsembleModal } from "./LoadEnsembleModal";
import { PartsList } from "./PartsList";
import { SelectInstrument } from "./SelectInstrumentDialog";

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
  const [isSaveEnsembleModalOpen, setIsSaveEnsembleModalOpen] = useState(false);
  const [ensembleIdToLoad, setEnsembleIdToLoad] = useState<number | null>(null);

  const [loadEnsembleState, sendLoadEnsemble] = useMachine(loadEnsembleMachine);

  const dispatch = useAppDispatch();
  const piece = useAppSelector((state) => state.piece.present);

  const onInstrumentSelect = useCallback(
    async (instrumentId: number) => {
      const instrument = (await invoke("instruments_get_by_id", {
        id: instrumentId,
      })) as Instrument;

      const maxPartId = Math.max(...piece.parts.map((part) => part.id), 0);

      dispatch(
        pushPart({
          id: maxPartId + 1,
          renaming: false,
          show: false,
          name: instrument.name,
          instruments: [instrument],
          file: null,
        })
      );
      dispatch(formatPartNumbers());
    },
    [piece.parts]
  );

  const handleConfirmSaveEnsemble = useCallback(
    async (name: string, category: string) => {
      const ensembleId = (await invoke("ensembles_add", {
        name,
        category: category === "" ? null : category,
      })) as number;

      for (let i = 0; i < piece.parts.length; i++) {
        const part = piece.parts[i];

        const ensemblePartId = (await invoke("ensemble_parts_add", {
          ensembleId,
          name: part.name,
        })) as number;

        await invoke("ensemble_parts_set_instruments", {
          ensemblePartId,
          instrumentIds: part.instruments.map((instrument) => instrument.id),
        });
      }
    },
    [piece.parts]
  );

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
        renaming: false,
        show: false,
        name: part.name,
        instruments: part.instruments,
        file: null,
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
        <SelectInstrument onInstrumentSelect={onInstrumentSelect} />
        <button
          onClick={() => setIsSaveEnsembleModalOpen(true)}
          className="text-left link flex gap-1"
        >
          <Icon path={mdiFloppy} size={1} />
          Save current parts as ensemble template
        </button>
        <button
          onClick={() => sendLoadEnsemble("SELECT")}
          className="text-left link flex gap-1"
        >
          <Icon path={mdiTextBoxPlusOutline} size={1} />
          Load ensemble
        </button>
      </div>
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
