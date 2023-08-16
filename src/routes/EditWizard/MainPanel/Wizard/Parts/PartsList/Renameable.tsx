import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "../../../../../../app/hooks";
import { debounce } from "../../../../../../app/utils";
import { setPartRenaming } from "../../../../pieceSlice";

export function Renameable(props: {
  name: string;
  isRenaming: boolean;
  index: number;
  setName: (name: string, index: number) => void;
}) {
  const { name, isRenaming, index, setName } = props;

  const dispatch = useAppDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    setName(event.target.value, index);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  useEffect(() => {
    window.addEventListener("mousedown", (e) => {
      if (inputRef.current && e.target !== inputRef.current) {
        dispatch(setPartRenaming({ partIndex: index, renaming: false }));
      }
    });

    return () => {
      window.removeEventListener("mousedown", () => {});
    };
  }, []);

  return (
    <>
      {isRenaming ? (
        <input
          ref={inputRef}
          className="text-fg.default bg-bg.inset outline-none px-[2px] rounded-[4px] w-fit"
          defaultValue={name}
          onChange={handleChangeDebounced}
        />
      ) : (
        <span
          className="cursor-default"
          onDoubleClick={() =>
            dispatch(setPartRenaming({ partIndex: index, renaming: true }))
          }
        >
          {name}
        </span>
      )}
    </>
  );
}
