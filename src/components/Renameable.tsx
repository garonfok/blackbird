import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "../app/hooks";
import { debounce } from "../app/utils";
import {
  setPartRenaming,
  setScoreRenaming,
} from "../routes/EditWizard/pieceSlice";

export function Renameable(props: {
  name: string;
  isPart: boolean;
  isRenaming: boolean;
  index: number;
  setName: (name: string, index: number) => void;
}) {
  const { name, isPart, isRenaming, index, setName } = props;

  const dispatch = useAppDispatch();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeDebounced = useCallback(debounce(handleChange), [index]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.value) return;
    setName(event.target.value, index);
  }

  useEffect(() => {
    window.addEventListener("mousedown", (e) => {
      if (inputRef.current && e.target !== inputRef.current) {
        if (isPart) {
          dispatch(setPartRenaming({ partIndex: index, renaming: false }));
        } else {
          dispatch(setScoreRenaming({ scoreIndex: index, renaming: false }));
        }
      }
    });

    return () => {
      window.removeEventListener("mousedown", () => {});
    };
  }, [index]);

  function handleDoubleClickRenaming() {
    if (isPart) {
      dispatch(setPartRenaming({ partIndex: index, renaming: true }));
    } else {
      dispatch(setScoreRenaming({ scoreIndex: index, renaming: true }));
    }
  }

  return (
    <>
      {isRenaming ? (
        <input
          ref={inputRef}
          className="text-fg.default bg-bg.inset outline-none px-[4px] rounded-[4px]"
          defaultValue={name}
          onChange={handleChangeDebounced}
        />
      ) : (
        <span
          className="cursor-default"
          onDoubleClick={handleDoubleClickRenaming}
        >
          {name}
        </span>
      )}
    </>
  );
}
