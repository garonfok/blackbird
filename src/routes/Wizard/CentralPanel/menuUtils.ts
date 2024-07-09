import { CheckedState } from "@/components/ui/checkbox";
import { Dispatch, SetStateAction } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { partFormSchema, pieceFormSchema, scoreFormSchema } from "../types";
import { formatPartNumbers } from "@/app/utils";

type ItemType = "parts" | "scores";
type PartScoreType =
  | z.infer<typeof partFormSchema>
  | z.infer<typeof scoreFormSchema>;

export function clearFile(
  id: number,
  type: ItemType,
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>,
) {
  pieceForm.setValue(
    type,
    pieceForm.getValues(type).map((item: PartScoreType) => {
      if (item.id === id) {
        return {
          ...item,
          file: undefined,
        };
      }
      return item;
    }),
  );
}

export function removeItem(
  id: number,
  type: ItemType,
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>,
  checkedMap: Map<string, CheckedState>,
  setCheckedMap: Dispatch<SetStateAction<Map<string, CheckedState>>>,
) {
  pieceForm.setValue(
    type,
    pieceForm.getValues(type).filter((item) => item.id !== id),
  );
  const formattedId = type === "parts" ? `p${id}` : `s${id}`;
  checkedMap.delete(formattedId);
  setCheckedMap(new Map(checkedMap));
}

export function duplicate(
  id: number,
  type: ItemType,
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>,
) {
  const item = pieceForm.getValues(type).find((item) => item.id === id)!;
  const index = pieceForm
    .getValues(type)
    .map((item) => item.id)
    .indexOf(id);
  const newItem = {
    ...item,
    id:
      Math.max(
        ...pieceForm.getValues(type).map((item: PartScoreType) => item.id),
        0,
      ) + 1,
  };

  pieceForm.setValue(type, [
    ...pieceForm.getValues(type).slice(0, index + 1),
    newItem,
    ...pieceForm.getValues(type).slice(index + 1),
  ]);
}

export function moveAbove(
  ids: number[],
  type: ItemType,
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>,
) {
  const items = pieceForm.getValues(type);
  const selectedItems = items.filter((item) => ids.includes(item.id));
  const unselectedItems = items.filter((item) => !ids.includes(item.id));
  const selectedItemsIds = selectedItems.map((item) => item.id);
  const firstIndex = items.map((item) => item.id).indexOf(selectedItemsIds[0]);

  pieceForm.setValue(type, [
    ...unselectedItems.slice(0, Math.max(firstIndex - 1, 0)),
    ...selectedItems,
    ...unselectedItems.slice(Math.max(firstIndex - 1, 0)),
  ]);

  formatPartNumbers(pieceForm);
}

export function moveBelow(
  ids: number[],
  type: ItemType,
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>,
) {
  const items = pieceForm.getValues(type);
  const selectedItems = items.filter((item) => ids.includes(item.id));
  const unselectedItems = items.filter((item) => !ids.includes(item.id));
  const lastIndex = items.map((item) => item.id).indexOf(ids[ids.length - 1]);

  pieceForm.setValue(type, [
    ...unselectedItems.slice(0, lastIndex + 1),
    ...selectedItems,
    ...unselectedItems.slice(lastIndex + 1),
  ]);

  formatPartNumbers(pieceForm);
}
