import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { CaretDown, CaretUp, Eraser, X } from "@phosphor-icons/react";
import {
  clearDifficultyMax,
  clearDifficultyMin,
  clearInstruments,
  clearRole,
  clearTags,
  clearYearPublishedMax,
  clearYearPublishedMin,
  resetFilter,
} from "../../../reducers/filterSlice";
import { clearSetlist } from "../../../reducers/setlistSlice";
import {
  clickComposers,
  clickTitle,
  clickUpdatedAt,
  clickYearPublished,
  resetSorting,
} from "../sortSlice";
import { FilterBadge } from "./FilterBadge";
import { FilterMenu } from "./FilterMenu";

const sortOptions = [
  { id: "title", label: "Title" },
  { id: "composers", label: "Composers" },
  { id: "yearPublished", label: "Year" },
  { id: "updatedAt", label: "Updated" },
];

const initialFilterState = {
  tags: [],
  yearPublishedMin: undefined,
  yearPublishedMax: undefined,
  difficultyMin: undefined,
  difficultyMax: undefined,
  instruments: [],
  composers: [],
  arrangers: [],
  lyricists: [],
  orchestrators: [],
  transcribers: [],
};

export function FilterBar() {
  const filter = useAppSelector((state) => state.filter);
  const setlist = useAppSelector((state) => state.setlist);

  const dispatch = useAppDispatch();
  const sorting = useAppSelector((state) => state.sorting);

  function handleClickDropdownSelect(optionId: string) {
    switch (optionId) {
      case "title":
        dispatch(clickTitle());
        break;
      case "composers":
        dispatch(clickComposers());
        break;
      case "yearPublished":
        dispatch(clickYearPublished());
        break;
      case "updatedAt":
        dispatch(clickUpdatedAt());
        break;
    }
  }

  function handleClickResetFilters() {
    dispatch(resetSorting());
    dispatch(clearSetlist());
    dispatch(resetFilter());
  }

  return (
    <div className="flex gap-[4px] items-start text-fg.1 p-[4px] bg-bg.1 border-b border-divider.default">
      <div className="flex gap-[4px] w-full flex-wrap items-center">
        <FilterMenu />
        {filter.tags.length > 0 && (
          <FilterBadge name="Tags" onClose={() => dispatch(clearTags())}>
            <Tooltip>
              <TooltipTrigger>
                {filter.tags.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">{filter.tags.length}</span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.tags.map((tag) => tag.name)}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.tags.map((tag) => tag.name).join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
        {(filter.yearPublishedMin !== undefined ||
          filter.yearPublishedMax !== undefined) && (
          <Badge variant="outline" className="p-0">
            <span className="text-fg.1 p-[4px]">Published</span>
            {filter.yearPublishedMin && (
              <span className="flex gap-[4px] bg-bg.2 h-full w-full items-center border-l border-divider.default p-[4px]">
                <span>From</span>
                <span className="text-fg.0">{filter.yearPublishedMin}</span>
                <Button
                  onClick={() => dispatch(clearYearPublishedMin())}
                  variant="link"
                  className="p-0"
                >
                  <X size={16} weight="bold" />
                </Button>
              </span>
            )}
            {filter.yearPublishedMax && (
              <span className="flex gap-[4px] bg-bg.2 h-full w-full items-center border-l border-divider.default p-[4px]">
                <span>To</span>
                <span className="text-fg.0">{filter.yearPublishedMax}</span>
                <Button
                  onClick={() => dispatch(clearYearPublishedMax())}
                  variant="link"
                  className="p-0"
                >
                  <X size={16} weight="bold" />
                </Button>
              </span>
            )}
          </Badge>
        )}
        {(filter.difficultyMin !== undefined ||
          filter.difficultyMax !== undefined) && (
          <Badge variant="outline" className="p-0">
            <span className="text-fg.1 p-[4px]">Grade</span>
            {filter.difficultyMin && (
              <span className="flex gap-[4px] bg-bg.2 h-full w-full items-center border-l border-divider.default p-[4px]">
                <span>From</span>
                <span className="text-fg.0">{filter.difficultyMin}</span>
                <Button
                  onClick={() => dispatch(clearDifficultyMin())}
                  variant="link"
                  className="p-0"
                >
                  <X size={16} weight="bold" />
                </Button>
              </span>
            )}
            {filter.difficultyMax && (
              <span className="flex gap-[4px] bg-bg.2 h-full w-full items-center border-l border-divider.default px-[4px]">
                <span>To</span>
                <span className="text-fg.0">{filter.difficultyMax}</span>
                <Button
                  onClick={() => dispatch(clearDifficultyMax())}
                  variant="link"
                  className="p-0"
                >
                  <X size={16} weight="bold" />
                </Button>
              </span>
            )}
          </Badge>
        )}
        {filter.instruments.length > 0 && (
          <FilterBadge
            name="Instruments"
            onClose={() => dispatch(clearInstruments())}
          >
            <Tooltip>
              <TooltipTrigger>
                {filter.instruments.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">
                      {filter.instruments.length}
                    </span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.instruments.map((instrument) => instrument.name)}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.instruments
                  .map((instrument) => instrument.name)
                  .join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
        {filter.composers.length > 0 && (
          <FilterBadge
            name="Composers"
            onClose={() => dispatch(clearRole("composers"))}
          >
            <Tooltip>
              <TooltipTrigger>
                {filter.composers.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">{filter.composers.length}</span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.composers
                      .map((musician) =>
                        musician.last_name
                          ? `${musician.first_name} ${musician.last_name}`
                          : musician.first_name,
                      )
                      .join(", ")}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.composers
                  .map((musician) =>
                    musician.last_name
                      ? `${musician.first_name} ${musician.last_name}`
                      : musician.first_name,
                  )
                  .join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
        {filter.arrangers.length > 0 && (
          <FilterBadge
            name="Arrangers"
            onClose={() => dispatch(clearRole("arrangers"))}
          >
            <Tooltip>
              <TooltipTrigger>
                {filter.arrangers.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">{filter.arrangers.length}</span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.arrangers
                      .map((musician) =>
                        musician.last_name
                          ? `${musician.first_name} ${musician.last_name}`
                          : musician.first_name,
                      )
                      .join(", ")}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.arrangers
                  .map((musician) =>
                    musician.last_name
                      ? `${musician.first_name} ${musician.last_name}`
                      : musician.first_name,
                  )
                  .join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
        {filter.orchestrators.length > 0 && (
          <FilterBadge
            name="Orchestrators"
            onClose={() => dispatch(clearRole("orchestrators"))}
          >
            <Tooltip>
              <TooltipTrigger>
                {filter.orchestrators.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">
                      {filter.orchestrators.length}
                    </span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.orchestrators
                      .map((musician) =>
                        musician.last_name
                          ? `${musician.first_name} ${musician.last_name}`
                          : musician.first_name,
                      )
                      .join(", ")}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.orchestrators
                  .map((musician) =>
                    musician.last_name
                      ? `${musician.first_name} ${musician.last_name}`
                      : musician.first_name,
                  )
                  .join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
        {filter.transcribers.length > 0 && (
          <FilterBadge
            name="Transcribers"
            onClose={() => dispatch(clearRole("transcribers"))}
          >
            <Tooltip>
              <TooltipTrigger>
                {filter.transcribers.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">
                      {filter.transcribers.length}
                    </span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.transcribers
                      .map((musician) =>
                        musician.last_name
                          ? `${musician.first_name} ${musician.last_name}`
                          : musician.first_name,
                      )
                      .join(", ")}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.transcribers
                  .map((musician) =>
                    musician.last_name
                      ? `${musician.first_name} ${musician.last_name}`
                      : musician.first_name,
                  )
                  .join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
        {filter.lyricists.length > 0 && (
          <FilterBadge
            name="Lyricists"
            onClose={() => dispatch(clearRole("lyricists"))}
          >
            <Tooltip>
              <TooltipTrigger>
                {filter.lyricists.length > 1 ? (
                  <span className="flex gap-[4px]">
                    <span className="text-fg.0">{filter.lyricists.length}</span>
                    selected
                  </span>
                ) : (
                  <span className="text-fg.0">
                    {filter.lyricists
                      .map((musician) =>
                        musician.last_name
                          ? `${musician.first_name} ${musician.last_name}`
                          : musician.first_name,
                      )
                      .join(", ")}
                  </span>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {filter.lyricists
                  .map((musician) =>
                    musician.last_name
                      ? `${musician.first_name} ${musician.last_name}`
                      : musician.first_name,
                  )
                  .join(", ")}
              </TooltipContent>
            </Tooltip>
          </FilterBadge>
        )}
      </div>
      <div className="flex gap-[4px] border-l border-divider.default pl-[4px] items-center">
        {(JSON.stringify(filter) !== JSON.stringify(initialFilterState) ||
          setlist.setlist ||
          sorting.id !== "updatedAt" ||
          !sorting.descending) && (
          <Button
            onClick={handleClickResetFilters}
            className="gap-[4px]"
            variant="secondary"
          >
            <Eraser size={16} weight="fill" />
            <span>Clear filters</span>
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link" className="flex gap-[4px] h-[26px]">
              {sortOptions.find((option) => option.id === sorting.id)?.label}
              {sorting.descending ? (
                <CaretDown size={16} weight="fill" className="shrink-0" />
              ) : (
                <CaretUp size={16} weight="fill" className="shrink-0" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {sortOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                className="justify-between"
                onClick={() => handleClickDropdownSelect(option.id)}
              >
                {option.label}
                {sorting.id === option.id &&
                  (sorting.descending ? (
                    <CaretDown size={16} weight="fill" className="shrink-0" />
                  ) : (
                    <CaretUp size={16} weight="fill" className="shrink-0" />
                  ))}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
