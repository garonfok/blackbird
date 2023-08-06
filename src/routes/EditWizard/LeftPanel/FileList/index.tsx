import { useState } from "react";
import { Card } from "./Card";
import { useAppSelector } from "../../../../app/hooks";

export function FileList() {
  const files = useAppSelector((state) => state.files);
  const [hovered, setHovered] = useState<Array<boolean>>(
    Array(files.length).fill(false)
  );

  function handleMouseEnter(index: number) {
    const newHovered = [...hovered];
    newHovered[index] = true;
    setHovered(newHovered);
  }

  function handleMouseLeave(index: number) {
    const newHovered = [...hovered];
    newHovered[index] = false;
    setHovered(newHovered);
  }

  return (
    <ol className="flex flex-col gap-[8px] flex-grow">
      {files.map((file, index) => (
        <li key={file.name}>
          <Card
            file={file}
            onMove={() => {}}
            index={index}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={() => handleMouseLeave(index)}
            hovered={hovered[index]}
          />
        </li>
      ))}
    </ol>
  );
}
