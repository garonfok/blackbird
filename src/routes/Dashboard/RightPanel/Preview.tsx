import { mdiChevronDown, mdiCircle, mdiTag } from "@mdi/js";
import Icon from "@mdi/react";
import classNames from "classnames";
import { useState } from "react";
import { Piece } from "src/app/types";

export function Preview(props: { piece: Piece }) {
  const { piece } = props;

  const [open, setOpen] = useState<boolean[]>(
    piece.parts.map((part) => part.instruments.length > 1)
  );

  function handleClickToggleOpen(index: number) {
    const newOpen = [...open];
    newOpen[index] = !newOpen[index];
    setOpen(newOpen);
  }

  return (
    piece && (
      <div className="flex flex-col h-0 gap-[14px] flex-grow overflow-y-auto scrollbar-default">
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
            {piece.year_published && (
              <span className="text-fg.muted">{piece.year_published}</span>
            )}
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
                <span className="flex flex-wrap text-fg.muted">
                  Arr.{" "}
                  {piece.arrangers
                    .map((arranger) =>
                      [arranger.first_name, arranger.last_name].join(" ")
                    )
                    .join(", ")}
                </span>
              )}
              {piece.transcribers.length > 0 && (
                <span className="flex flex-wrap text-fg.muted">
                  Trans.{" "}
                  {piece.transcribers
                    .map((transcriber) =>
                      [transcriber.first_name, transcriber.last_name].join(" ")
                    )
                    .join(", ")}
                </span>
              )}
              {piece.orchestrators.length > 0 && (
                <span className="flex flex-wrap text-fg.muted">
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
                <span className="flex flex-wrap text-fg.muted">
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
        <div className="flex flex-col gap-[14px]">
          <div className="flex flex-col text-fg.muted">
            {piece.title.length > 0 &&
              piece.composers.length > 0 &&
              piece.scores.map((score) => (
                <div key={score.id} className="flex gap-[4px] items-center">
                  <span>{score.name}</span>
                  <Icon
                    path={mdiCircle}
                    size={0.5}
                    className={classNames(
                      score.path ? "text-fg.default" : "text-fg.subtle"
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
                        part.path ? "text-fg.default" : "text-fg.subtle"
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
                  <div className="ml-[14px] flex-wrap flex text-fg.muted">
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
          <div className="break-words px-[14px] py-[8px] rounded-[4px] bg-bg.inset">
            {piece.notes}
          </div>
        )}
      </div>
    )
  );
}
