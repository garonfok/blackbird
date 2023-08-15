import { useCallback, useEffect, useRef, useState } from "react";
import { debounce } from "../../../../../../app/utils";

export function Renameable(props: {
  name: string;
  index: number;
  setName: (name: string, index: number) => void;
}) {
  const { name, index, setName } = props;

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) return;
    setName(event.target.value, index);
  };

  const inputRef = useRef<HTMLInputElement>(null);

  const handleChangeDebounced = useCallback(debounce(handleChange), []);

  useEffect(() => {
    window.addEventListener("mousedown", (e) => {
      if (inputRef.current && e.target !== inputRef.current) {
        setIsEditing(false);
      }
    });

    return () => {
      window.removeEventListener("mousedown", () => {});
    };
  }, []);

  return (
    <>
      {isEditing ? (
        <input
          ref={inputRef}
          className="text-fg.default bg-bg.inset outline-none px-[2px] rounded-[4px] w-fit"
          defaultValue={name}
          onChange={handleChangeDebounced}
        />
      ) : (
        <span
          className="cursor-default"
          onDoubleClick={() => setIsEditing(true)}
        >
          {name}
        </span>
      )}
    </>
  );
}
