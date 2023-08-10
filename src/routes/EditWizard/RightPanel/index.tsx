import { useEffect, useState } from "react";
import { ResizableRight } from "../../../components/ResizeableRight";
import { useAppSelector } from "../../../app/hooks";
import Icon from "@mdi/react";
import { mdiTag } from "@mdi/js";

export function RightPanel() {
  const [maxWidth, setMaxWidth] = useState<number>(512);

  const piece = useAppSelector((state) => state.piece);

  useEffect(() => {
    window.addEventListener("resize", () => {
      if (window.innerWidth < 1280) {
        setMaxWidth(256);
      } else {
        setMaxWidth(512);
      }
    });

    return () => {
      window.removeEventListener("resize", () => {});
    };
  }, []);

  return (
    <ResizableRight minWidth={256} width={384} maxWidth={maxWidth}>
      <div className="flex flex-col h-full gap-[14px]">
        <div className="flex flex-wrap gap-[14px]">
          {piece.tags.map((tag) => {
            return (
              <div key={tag.id} className="flex gap-[4px] items-center">
                <Icon path={mdiTag} size={1} color={tag.color} />
                <span>{tag.name}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col gap-[14px]">
          <div className="flex flex-col gap-[4px]">
            {piece.difficulty && (
              <span className="text-fg.muted">Grade {piece.difficulty}</span>
            )}
            <span className="text-[20px] font-bold">{piece.title}</span>
            {piece.yearPublished && (
              <span className="text-fg.muted">{piece.yearPublished}</span>
            )}
          </div>
          <div>
            <div className="">
              {/* Join all composers with commas */}
              <span className="flex flex-wrap">
                {piece.composers
                  .map((composer) =>
                    [composer.first_name, composer.last_name].join(" ")
                  )
                  .join(", ")}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow"></div>
        <div className="break-words">{piece.notes}</div>
      </div>
    </ResizableRight>
  );
}
