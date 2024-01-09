import { mdiChevronDown, mdiCircle, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useAppSelector } from "src/app/hooks";
import { ResizableRight } from "src/components/ResizeableRight";

export function RightPanel() {
  const piece = useAppSelector((state) => state.piece.present);

  const [maxWidth, setMaxWidth] = useState<number>(512);
  const [open, setOpen] = useState<boolean[]>(
    piece.parts.map((part) => part.instruments.length > 1)
  );

  useEffect(() => {
    window.addEventListener("resize", handleReize);

    return () => {
      window.removeEventListener("resize", handleReize);
    };
  }, []);

  function handleReize() {
    if (window.innerWidth < 1280) {
      setMaxWidth(256);
    } else {
      setMaxWidth(512);
    }
  }

  function handleClickToggleOpen(index: number) {
    const newOpen = [...open];
    newOpen[index] = !newOpen[index];
    setOpen(newOpen);
  }

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
            {piece.difficulty && <span>Grade {piece.difficulty}</span>}
            <span className="text-[20px] font-bold">{piece.title}</span>
            {piece.yearPublished && <span>{piece.yearPublished}</span>}
          </div>
          <div>
            <div className="">
              <span className="flex flex-wrap">
                {piece.composers
                  .map((composer) =>
                    [composer.first_name, composer.last_name].join(" ")
                  )
                  .join(", ")}
              </span>
              {piece.arrangers.length > 0 && (
                <span className="flex flex-wrap">
                  Arr.{" "}
                  {piece.arrangers
                    .map((arranger) =>
                      [arranger.first_name, arranger.last_name].join(" ")
                    )
                    .join(", ")}
                </span>
              )}
              {piece.transcribers.length > 0 && (
                <span className="flex flex-wrap">
                  Trans.{" "}
                  {piece.transcribers
                    .map((transcriber) =>
                      [transcriber.first_name, transcriber.last_name].join(" ")
                    )
                    .join(", ")}
                </span>
              )}
              {piece.orchestrators.length > 0 && (
                <span className="flex flex-wrap">
                  Orch.{" "}
                  {piece.orchestrators
                    .map((orchestrator) =>
                      [orchestrator.first_name, orchestrator.last_name].join(
                        " "
                      )
                    )
                    .join(", ")}
                </span>
              )}
              {piece.lyricists.length > 0 && (
                <span className="flex flex-wrap">
                  Lyr.{" "}
                  {piece.lyricists
                    .map((lyricist) =>
                      [lyricist.first_name, lyricist.last_name].join(" ")
                    )
                    .join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col flex-grow overflow-y-auto scrollbar-default gap-[14px]">
          <div className="flex flex-col text-fg.1">
            {piece.title.length > 0 &&
              piece.composers.length > 0 &&
              piece.scores.map((score) => (
                <div key={score.id} className="flex gap-[4px] items-center">
                  <span>{score.name}</span>
                  <Icon
                    path={mdiCircle}
                    size={0.5}
                    className={classNames(
                      score.file ? "text-fg.0" : "text-fg.2"
                    )}
                  />
                </div>
              ))}
          </div>
          <div className="flex flex-col">
            {piece.parts.map((part, index) => (
              <div key={part.id} className="">
                <button
                  className="flex gap-[4px] justify-between w-full"
                  onClick={() => handleClickToggleOpen(index)}
                >
                  <span className="flex items-center gap-[4px]">
                    <span className="truncate">{part.name}</span>
                    <Icon
                      path={mdiCircle}
                      size={0.5}
                      className={classNames(
                        part.file ? "text-fg.0" : "text-fg.2"
                      )}
                    />
                  </span>
                  <Icon
                    path={mdiChevronDown}
                    size={1}
                    className={classNames(
                      "transition-all",
                      open[index] && "rotate-180"
                    )}
                  />
                </button>
                {open[index] && (
                  <div className="ml-[14px] flex-wrap flex text-fg.1">
                    {part.instruments
                      .map((instrument) => instrument.name)
                      .join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {piece.notes.length > 0 && (
          <div className="break-words px-[14px] py-[8px] rounded-default bg-bg.1">
            {piece.notes}
          </div>
        )}
      </div>
    </ResizableRight>
  );
}
