import { ByteFile } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Checkbox, CheckedState } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FormField } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { mdiDotsHorizontal, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { MouseEvent, useEffect, useState } from "react";
import { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { pieceFormSchema } from "../../types";
import { SortableItem } from "../SortableItem";
import { clearFile, duplicate, moveAbove, moveBelow, removeItem } from "../menuUtils";

export function Scores(props: {
  pieceForm: UseFormReturn<z.infer<typeof pieceFormSchema>>;
  uploadedFiles: ByteFile[];
}) {
  const { pieceForm, uploadedFiles } = props;

  const [anchor, setAnchor] = useState(0);
  const [checkedMap, setCheckedMap] = useState(new Map<string, CheckedState>());

  useEffect(() => {
    function resetCheckboxStates() {
      const newCheckedMap = new Map<string, CheckedState>();
      pieceForm.getValues("scores").forEach((score) => {
        newCheckedMap.set(`s${score.id}`, false);
      });
      setCheckedMap(newCheckedMap);
    }

    resetCheckboxStates();
  }, [])

  function handleClickAddScore(
    field: ControllerRenderProps<z.infer<typeof pieceFormSchema>, "scores">,
  ) {
    const id = Math.max(...field.value.map((score) => score.id), 0) + 1;

    field.onChange([
      ...field.value,
      {
        id,
        name: "Full Score",
      },
    ]);

    setCheckedMap(new Map(checkedMap.set(`s${id}`, false)));
  }

  function handleClickCheck(
    event: MouseEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.shiftKey) {
      let adjustedAnchor = anchor;

      while (pieceForm.getValues("scores")[adjustedAnchor] === undefined) {
        adjustedAnchor--;
      }

      const min = Math.min(adjustedAnchor, index);
      let max = Math.max(adjustedAnchor, index);
      const selected = pieceForm.getValues("scores")[index]!;
      const selectedChecked = checkedMap.get(`s${selected.id}`);

      for (let i = min; i <= max; i++) {
        const score = pieceForm.getValues("scores")[i]!;
        checkedMap.set(`s${score.id}`, !selectedChecked);
      }
    } else {
      const score = pieceForm.getValues("scores")[index]!;
      checkedMap.set(`s${score.id}`, !checkedMap.get(`s${score.id}`));
    }
    setCheckedMap(new Map(checkedMap));
    setAnchor(index);
  }

  function getHeaderCheckedState() {
    if (checkedMap.size === 0) {
      return false;
    }

    if (Array.from(checkedMap.values()).every((value) => value)) {
      return true;
    }
    if (Array.from(checkedMap.values()).every((value) => !value)) {
      return false;
    }
    return "indeterminate";
  }

  function handleCheckHeader() {
    const newCheckedMap = new Map<string, CheckedState>();

    const values = Array.from(checkedMap.values());

    if (values.every((value) => !value)) {
      for (const key of checkedMap.keys()) {
        newCheckedMap.set(key, true);
      }
    } else {
      for (const key of checkedMap.keys()) {
        newCheckedMap.set(key, false);
      }
    }

    setCheckedMap(newCheckedMap);
  }

  function handleClickClearFile() {
    for (const [key, value] of checkedMap.entries()) {
      if (value) {
        clearFile(parseInt(key.slice(1)), "scores", pieceForm);
      }
    }
  }

  function handleClickDuplicate() {
    for (const [key, value] of checkedMap.entries()) {
      if (value) {
        duplicate(parseInt(key.slice(1)), "scores", pieceForm);
      }
    }
  }

  function handleClickMoveAbove() {
    const selectedIds = Array.from(checkedMap.entries())
      .filter((entry) => entry[1])
      .map((entry) => parseInt(entry[0].slice(1)));
    moveAbove(selectedIds, "scores", pieceForm);
  }

  function handleClickMoveBelow() {
    const selectedIds = Array.from(checkedMap.entries())
      .filter((entry) => entry[1])
      .map((entry) => parseInt(entry[0].slice(1)));
    moveBelow(selectedIds, "scores", pieceForm);
  }

  function handleClickRemoveItem() {
    for (const [key, value] of checkedMap.entries()) {
      if (value) {
        removeItem(parseInt(key.slice(1)), "scores", pieceForm, checkedMap, setCheckedMap);
      }
    }
  }


  return (
    <FormField
      control={pieceForm.control}
      name="scores"
      render={({ field }) => (
        <div className="flex flex-col gap-[8px] h-full">
          <Separator />
          <div className="flex items-center px-[10px] gap-[4px]">
            <Button
              type="button"
              variant="main"
              className="p-1"
              onClick={() => handleClickAddScore(field)}
            >
              <Icon path={mdiPlus} size={2 / 3} />
            </Button>
            <Checkbox
              checked={getHeaderCheckedState()}
              onCheckedChange={handleCheckHeader}
            />
            {Array.from(checkedMap.values()).filter((val) => val).length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link" className="p-0" type="button">
                    <Icon path={mdiDotsHorizontal} size={1} className="shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={handleClickClearFile}>
                    Clear file
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClickMoveAbove}>
                    Move above
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClickMoveBelow}>
                    Move below
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClickDuplicate}>
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleClickRemoveItem}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          <SortableContext
            id="score-list"
            items={field.value.map((score) => `s${score.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="h-full flex flex-col">
              <ScrollArea className="h-0 grow">
                <div className="flex flex-col gap-[4px]">
                  {field.value.map((score, index) => (
                    <SortableItem
                      key={score.id}
                      id={`s${score.id}`}
                      pieceForm={pieceForm}
                      item={score}
                      uploadedFiles={uploadedFiles}
                      checkedMap={checkedMap}
                      setCheckedMap={setCheckedMap}
                      handleClickCheck={(event) =>
                        handleClickCheck(event, index)
                      }
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </SortableContext>
        </div>
      )}
    />
  );
}
