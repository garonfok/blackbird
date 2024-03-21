import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { EditPart, Ensemble, Instrument } from "@/app/types";
import { invoke } from "@tauri-apps/api";
import { useCallback } from "react";
import { formatPartNumbers, pushPart, setParts } from "../../../pieceSlice";
import { PartsList } from "./PartsList";
import { SaveEnsemble } from "./SaveEnsembleDialog";
import { SelectEnsemble } from "./SelectEnsembleDialog";
import { SelectInstrument } from "./SelectInstrumentDialog";

export function Parts() {
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

  const onSubmitSaveEnsemble = useCallback(
    async (name: string, category?: string) => {
      const ensembleId = (await invoke("ensembles_add", {
        name,
        category: category === undefined ? null : category,
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

  async function onEnsembleSelect(ensembleId: number) {
    const ensemble = (await invoke("ensembles_get_by_id", {
      id: ensembleId,
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
  }

  return (
    <>
      <div className="edit-wizard-panel overflow-hidden">
        <PartsList />
        <SelectInstrument onInstrumentSelect={onInstrumentSelect} />
        <SaveEnsemble onSubmit={onSubmitSaveEnsemble} />
        <SelectEnsemble onEnsembleSelect={onEnsembleSelect} />
      </div>
    </>
  );
}
