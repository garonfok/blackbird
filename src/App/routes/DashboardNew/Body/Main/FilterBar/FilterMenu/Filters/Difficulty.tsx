import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { cn } from "@/utils/lib";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  clearDifficultyMax,
  clearDifficultyMin,
  setDifficultyMax,
  setDifficultyMin,
} from "../../../../../reducers/filterSlice";

export function Difficulty() {
  const filter = useAppSelector((state) => state.filter);
  const dispatch = useAppDispatch();

  function handleChangeMin(value: string) {
    if (value === "none") {
      dispatch(clearDifficultyMin());
    } else {
      const max = filter.difficultyMax;
      if (max && parseInt(value) > max) {
        dispatch(setDifficultyMax(parseInt(value)));
        dispatch(setDifficultyMin(max));
      } else {
        dispatch(setDifficultyMin(parseInt(value)));
      }
    }
  }

  function handleChangeMax(value: string) {
    if (value === "none") {
      dispatch(clearDifficultyMax());
    } else {
      const min = filter.difficultyMin;
      if (min && parseInt(value) < min) {
        dispatch(setDifficultyMin(parseInt(value)));
        dispatch(setDifficultyMax(min));
      } else {
        dispatch(setDifficultyMax(parseInt(value)));
      }
    }
  }

  return (
    <div className="flex flex-col gap-[8px]">
      <div className="flex gap-[8px] items-center justify-between">
        <span className="text-fg.2 select-none cursor-default text-sm">
          From
        </span>
        <Select
          value={filter.difficultyMin?.toString() ?? "none"}
          onValueChange={handleChangeMin}
        >
          <SelectTrigger
            className={cn(!filter.difficultyMin && "text-fg.2", "w-32")}
          >
            <SelectValue placeholder="Select a minimum grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectSeparator />
            {Array.from({ length: 6 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                Grade {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-[8px] items-center justify-between">
        <span className="text-fg.2 select-none cursor-default text-sm">To</span>
        <Select
          value={filter.difficultyMax?.toString() ?? "none"}
          onValueChange={handleChangeMax}
        >
          <SelectTrigger
            className={cn(!filter.difficultyMax && "text-fg.2", "w-32")}
          >
            <SelectValue placeholder="Select a maximum grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {Array.from({ length: 6 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                Grade {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
