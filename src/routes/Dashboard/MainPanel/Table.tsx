import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { Piece, Tag } from "@/app/types";
import { isWindows } from "@/app/utils";
import { Modal } from "@/components/Modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  mdiArrowDown,
  mdiArrowUp,
  mdiCircle,
  mdiClose,
  mdiDotsHorizontal,
  mdiEraser
} from "@mdi/js";
import { Icon } from "@mdi/react";
import {
  Column,
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { invoke } from "@tauri-apps/api";
import { useMachine } from "@xstate/react";
import classNames from "classnames";
import Fuse from "fuse.js";
import { DateTime } from "luxon";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  clearDifficulty,
  clearInstruments,
  clearRole,
  clearYearPublished,
  pushTag,
  removeTag,
  resetFilter
} from "../reducers/filterSlice";
import { setPieces } from "../reducers/piecesSlice";
import { clearPiece, setPiece } from "../reducers/previewSlice";
import { mainSortMachine } from "./mainSortMachine";

const sortOptions = [
  { id: "id", label: "#" },
  { id: "main", label: "Title" },
  { id: "composers", label: "Composers" },
  { id: "yearPublished", label: "Year" },
  { id: "updatedAt", label: "Updated" },
];

export function Table() {
  const [filteredPieces, setFilteredPieces] = useState<Piece[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [isMainTitle, setIsMainTitle] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [anchor, setAnchor] = useState(0);
  const [isConfirmDeletePieceModalOpen, setIsConfirmDeletePieceModalOpen] =
    useState(false);
  const [pieceIdToDelete, setPieceIdToDelete] = useState<number | null>(null);

  const [mainSortState, sendMainSortState] = useMachine(mainSortMachine);

  const navigate = useNavigate();

  const setlists = useAppSelector((state) => state.setlists);
  const filter = useAppSelector((state) => state.filter);
  const query = useAppSelector((state) => state.query);
  const tags = useAppSelector((state) => state.tags);
  const pieces = useAppSelector((state) => state.pieces);
  const setlist = useAppSelector((state) => state.setlist);
  const preview = useAppSelector((state) => state.preview);
  const dispatch = useAppDispatch();

  const tableRef = useRef<HTMLTableElement>(null);
  const rowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    table.getColumn("composers")?.toggleVisibility(false);

    fetchPieces();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width < 512) {
          table.getColumn("yearPublished")?.toggleVisibility(false);
          table.getColumn("updatedAt")?.toggleVisibility(false);
        } else {
          table.getColumn("yearPublished")?.toggleVisibility(true);
          table.getColumn("updatedAt")?.toggleVisibility(true);
        }
      }
    });

    resizeObserver.observe(tableRef.current!);

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchPieces();
  }, [tags, setlist]);

  useEffect(() => {
    setSelected([]);

    let filteringPieces = pieces;

    if (query) {
      const results = fuse.search(query);
      filteringPieces = results.map((result) => result.item);
    }

    if (filter.tags.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.tags.every((tag) => {
          return piece.tags.some((pieceTag) => pieceTag.id === tag.id);
        });
      });
    }

    if (filter.yearPublishedMin !== undefined || filter.yearPublishedMax !== undefined) {
      filteringPieces = filteringPieces.filter((piece) => {
        return (
          piece.year_published &&
          piece.year_published >= (filter.yearPublishedMin ?? 0) &&
          piece.year_published <= (filter.yearPublishedMax ?? Infinity)
        );
      });
    }

    if (filter.yearPublishedMin !== undefined || filter.yearPublishedMax !== undefined) {
      filteringPieces = filteringPieces.filter((piece) => {
        return (
          piece.difficulty &&
          piece.difficulty >= (filter.difficultyMin ?? 0) &&
          piece.difficulty <= (filter.difficultyMax ?? Infinity)
        );
      });
    }

    if (filter.instruments.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.instruments.every((instrument) => {
          return piece.parts.some((piecePart) => {
            return piecePart.instruments.some(
              (piecePartInstrument) => piecePartInstrument.id === instrument.id
            );
          });
        });
      });
    }

    if (filter.composers.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.composers.every((composer) => {
          return piece.composers.some(
            (pieceComposer) => pieceComposer.id === composer.id
          );
        });
      });
    }

    if (filter.arrangers.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.arrangers.every((arranger) => {
          return piece.arrangers.some(
            (pieceArranger) => pieceArranger.id === arranger.id
          );
        });
      });
    }

    if (filter.orchestrators.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.orchestrators.every((orchestrator) => {
          return piece.orchestrators.some(
            (pieceOrchestrator) => pieceOrchestrator.id === orchestrator.id
          );
        });
      });
    }

    if (filter.transcribers.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.transcribers.every((transcriber) => {
          return piece.transcribers.some(
            (pieceTranscriber) => pieceTranscriber.id === transcriber.id
          );
        });
      });
    }

    if (filter.lyricists.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.lyricists.every((lyricist) => {
          return piece.lyricists.some(
            (pieceLyricist) => pieceLyricist.id === lyricist.id
          );
        });
      });
    }

    setFilteredPieces(filteringPieces);
  }, [query, filter, pieces]);

  const columns = useMemo<ColumnDef<Piece>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "id",
        header: () => <span className="">#</span>,
        cell: (info) => {
          const id = info.getValue() as string;
          return <span>{id}</span>;
        },
        size: 48,
      },
      {
        id: "main",
        accessorFn: (row) => row.title,
        header: () => {
          return <span className="text-left">Title</span>;
        },
        cell: (info) => {
          return (
            <div className="flex gap-[14px] items-center justify-between">
              <div className="flex gap-[14px] items-center">
                <div className="flex flex-col">
                  <span className="text-body-default text-fg.0">
                    {info.row.original.title}
                  </span>
                  <span className="text-body-small-default">
                    {info.row.original.composers
                      .map((composer) =>
                        composer.last_name
                          ? `${composer.first_name} ${composer.last_name}`
                          : `${composer.first_name}`
                      )
                      .join(", ")}
                  </span>
                </div>
                <ol>
                  {info.row.original.tags.map((tag) => (
                    <Badge
                      variant="outline"
                      className="gap-[4px] hover:text-fg.0 hover:border-divider.focus"
                      // onClick add tag to filter
                      onClick={() => handleClickPushTag(tag)}
                    >
                      <Icon path={mdiCircle} size={0.667} style={{ color: tag.color }} />
                      {tag.name}
                    </Badge>
                  ))}
                </ol>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="link">
                    <Icon
                      path={mdiDotsHorizontal}
                      size={1}
                      className="shrink-0"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>{isPieceInCurrentSetlist(info.row.original) && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleClickRemoveFromSetlist(
                        info.row.original.id,
                        setlist.setlist!.id
                      )
                    }
                  >
                    Remove from setlist
                  </DropdownMenuItem>
                )}
                  {isAvailableToAddToSetlist(info.row.original) && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        Add to setlist
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          {setlists
                            .filter(
                              (sl) =>
                                !info.row.original.setlists.some(
                                  (pieceSl) => pieceSl.id === sl.id
                                )
                            )
                            .map((sl) => (
                              <DropdownMenuItem
                                onClick={() =>
                                  handleClickAddToSetlist(
                                    info.row.original.id,
                                    sl.id
                                  )
                                }
                              >
                                {sl.name}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  )}
                  <DropdownMenuItem
                    onClick={async () =>
                      handleClickOpenFolder(info.row.original.path)
                    }
                  >
                    Open folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleClickEditPiece(info.row.original)
                    }
                  >
                    Edit data
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleClickPrintParts(info.row.original.path)
                    }
                  >
                    Print parts
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleClickDeletePiece(info.row.original.id)
                    }
                    className="text-error.default focus:text-error.focus"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div >
          );
        },
      },
      {
        id: "composers",
        accessorFn: (row) => {
          const { composers } = row;
          return composers
            .map((composer) =>
              composer.last_name
                ? `${composer.last_name}, ${composer.first_name}`
                : `${composer.first_name}`
            )
            .join(", ");
        },
      },
      {
        id: "yearPublished",
        accessorFn: (row) => row.year_published,
        header: () => <span className="">Year</span>,
        cell: (info) => {
          return <span className="text-fg.1">{info.getValue() as number}</span>;
        },
        size: 64,
      },
      {
        id: "updatedAt",
        accessorFn: (row) => DateTime.fromSQL(row.updated_at),
        header: () => <span className="">Updated</span>,
        cell: (info) => {
          const updatedAt = info.getValue() as DateTime;

          const formattedUpdatedAt = (() => {
            if (updatedAt.hasSame(DateTime.now(), "day")) {
              return updatedAt.toLocaleString(DateTime.TIME_SIMPLE);
            } else if (updatedAt.hasSame(DateTime.now(), "year")) {
              return updatedAt.toLocaleString({ month: 'short', day: 'numeric' });
            } else {
              return updatedAt.toLocaleString(DateTime.DATE_MED);
            }
          })();

          return (
            <span className="text-body-small-default">
              {formattedUpdatedAt}
            </span>
          );
        },
        size: 80,
      },
    ],
    [setlist.setlist, setlists]
  );

  const table = useReactTable({
    data: filteredPieces,
    state: { columnVisibility, sorting },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  async function fetchPieces() {
    const pieces = await (async () => {
      if (setlist.setlist) {
        return (await invoke("pieces_get_by_setlist", {
          setlistId: setlist.setlist.id,
        })) as Piece[];
      } else {
        return (await invoke("pieces_get_all")) as Piece[];
      }
    })();
    dispatch(setPieces({ pieces }));
  }

  async function handleClickSelect(
    event: MouseEvent<HTMLTableRowElement>,
    index: number
  ) {
    if ((await isWindows()) ? event.ctrlKey : event.metaKey) {
      if (selected.includes(index)) {
        setSelected(selected.filter((i) => i !== index));
        const nextGreatestIndex = selected
          .filter((i) => i < index)
          .sort((a, b) => b - a)[0];
        setAnchor(nextGreatestIndex || 0);
      } else {
        setAnchor(index);
        setSelected([...selected, index]);
      }
    } else if (event.shiftKey) {
      const min = Math.min(anchor, index);
      const max = Math.max(anchor, index);
      setSelected([...Array(max - min + 1).keys()].map((i) => i + min));
      setAnchor(index);
    } else {
      setSelected([index]);
      setAnchor(index);
    }
    dispatch(
      setPiece({ piece: table.getRowModel().rows[index].original as Piece })
    );
  }

  async function handleClickPushTag(tag: Tag) {
    dispatch(pushTag(tag));
  }

  function handleClick(event: globalThis.MouseEvent) {
    if (rowRef.current && !rowRef.current.contains(event.target as Node)) {
      setSelected([]);
    }
  }

  function handleClickSortColumn(headerColumn: Column<Piece, unknown>) {
    if (headerColumn.id !== "main") {
      if (
        !sorting[0].desc &&
        sorting[0].id !== "main" &&
        sorting[0].id !== "composers"
      ) {
        setSorting([{ id: "updatedAt", desc: true }]);
      } else {
        headerColumn.toggleSorting();
      }
      sendMainSortState("RESET");
      setIsMainTitle(true);
    } else {
      const mainColumn = table.getColumn("main");
      const composersColumn = table.getColumn("composers");

      if (isMainTitle) {
        if (
          sorting.length === 1 &&
          sorting[0].id === "main" &&
          !sorting[0].desc
        ) {
          setIsMainTitle(false);
          composersColumn?.toggleSorting();
        } else {
          mainColumn?.toggleSorting();
        }
      } else {
        if (
          sorting.length === 1 &&
          sorting[0].id === "composers" &&
          !sorting[0].desc
        ) {
          setIsMainTitle(true);
          setSorting([{ id: "updatedAt", desc: true }]);
        } else {
          composersColumn?.toggleSorting();
        }
      }

      switch (mainSortState.value) {
        case "updatedDesc":
          setIsMainTitle(true);
          mainColumn?.toggleSorting(false);
          break;
        case "titleAsc":
          setIsMainTitle(true);
          mainColumn?.toggleSorting(true);
          break;
        case "titleDesc":
          setIsMainTitle(false);
          composersColumn?.toggleSorting(false);
          break;
        case "composersAsc":
          setIsMainTitle(false);
          composersColumn?.toggleSorting(true);
          break;
        case "composersDesc":
          setIsMainTitle(true);
          setSorting([{ id: "updatedAt", desc: true }]);
          break;
      }

      sendMainSortState("CLICK");
    }
  }

  function handleClickDropdownSelect(optionId: string) {
    if (optionId !== sorting[0].id) {
      setSorting([{ id: optionId, desc: true }]);
    } else {
      setSorting([{ id: optionId, desc: !sorting[0].desc }]);
    }

    if (optionId === "composers") {
      setIsMainTitle(false);
    } else {
      setIsMainTitle(true);
    }
  }

  function handleClickResetFilters() {
    setSorting([{ id: "updatedAt", desc: true }]);
    dispatch(resetFilter());
  }

  async function handleClickOpenFolder(path: string) {
    await invoke("open", { path });
  }

  function handleClickEditPiece(piece: Piece) {
    navigate("/edit-wizard", { state: { piece } });
  }

  function handleClickPrintParts(path: string) {
    void path;
  }

  function handleClickDeletePiece(pieceId: number) {
    setPieceIdToDelete(pieceId);
    setIsConfirmDeletePieceModalOpen(true);
  }

  function handleCancelDeletePiece() {
    setIsConfirmDeletePieceModalOpen(false);
    setPieceIdToDelete(null);
  }

  async function handleConfirmDeletePiece() {
    setIsConfirmDeletePieceModalOpen(false);
    await invoke("pieces_delete", { id: pieceIdToDelete });
    if (preview.piece?.id === pieceIdToDelete) {
      dispatch(clearPiece());
    }
    setPieceIdToDelete(null);
    await fetchPieces();
  }

  async function handleClickAddToSetlist(
    pieceId: number,
    setlistId: number
  ) {
    await invoke("setlists_add_piece", { pieceId, setlistId });
    await fetchPieces();
  }

  async function handleClickRemoveFromSetlist(
    pieceId: number,
    setlistId: number
  ) {
    await invoke("setlists_remove_piece", { pieceId, setlistId });
    await fetchPieces();
  }

  function parseNumberRange(num1?: number, num2?: number) {
    if (num1 === undefined) {
      return `...${num2}`;
    } else if (num2 === undefined) {
      return `${num1}...`;
    } else {
      return `${num1} - ${num2}`;
    }
  }

  const isPieceInCurrentSetlist = useCallback(
    (piece: Piece) => {
      if (!setlist.setlist) return false;
      return piece.setlists.some((sl) => sl.id === setlist.setlist!.id);
    },
    [setlist.setlist, setlists]
  );

  const isAvailableToAddToSetlist = useCallback(
    (piece: Piece) => {
      for (const pieceSetlist of setlists) {
        if (!piece.setlists.some((sl) => sl.id === pieceSetlist.id)) {
          return true;
        }
      }
      return false;
    },
    [setlist.setlist, setlists]
  );

  const fuse = new Fuse(pieces, {
    useExtendedSearch: true,
    keys: [
      {
        name: "title",
        weight: 4,
      },
      {
        name: "composers",
        getFn: (piece) => {
          return piece.composers
            .map((composer) => `${composer.first_name} ${composer.last_name}`)
            .join(" ");
        },
        weight: 2,
      },
    ],
  });

  return (
    <>
      <div className="flex flex-col flex-grow">
        <div className="flex gap-[14px] items-center text-fg.1 flex-wrap px-[14px] py-[8px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="main">
                {sortOptions.find((option) => option.id === sorting[0].id)?.label}
                {sorting[0].desc ? (
                  <Icon path={mdiArrowDown} size={0.667} className="shrink-0" />
                ) : (
                  <Icon path={mdiArrowUp} size={0.667} className="shrink-0" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {sortOptions.map((option) => (
                <DropdownMenuItem key={option.id}
                  className="justify-between"
                  onClick={() => handleClickDropdownSelect(option.id)}
                >
                  {option.label}
                  {sorting[0].id === option.id ? (
                    <Icon
                      path={sorting[0].desc ? mdiArrowDown : mdiArrowUp}
                      size={0.667}
                      className=""
                    />
                  ) : (
                    <span className="w-[14px]" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {filter.tags.length > 0 &&
            filter.tags.map((tag) => (
              <Badge key={tag.id} variant="outline" className="gap-[14px]">
                <span className="flex items-center gap-[4px]">
                  <Icon path={mdiCircle} size={0.667} style={{ color: tag.color }} />
                  {tag.name}
                </span>
                <Button
                  onClick={() => dispatch(removeTag(tag.id))}
                  variant="link"
                >
                  <Icon path={mdiClose} size={0.667} />
                </Button>
              </Badge>
            ))}
          {(filter.yearPublishedMin !== undefined ||
            filter.yearPublishedMax !== undefined) && (
              <Badge variant="outline" className="gap-[14px]">
                <span className="flex gap-[4px]">
                  <span className="text-fg.1">Published:</span>
                  <span className="text-fg.0">
                    {parseNumberRange(
                      filter.yearPublishedMin,
                      filter.yearPublishedMax
                    )}
                  </span>
                </span>
                <Button
                  onClick={() => dispatch(clearYearPublished())}
                  variant="link"
                >
                  <Icon path={mdiClose} size={0.667} />
                </Button>
              </Badge>
            )}
          {(filter.difficultyMin !== undefined ||
            filter.difficultyMax !== undefined) && (
              <Badge variant="outline" className="gap-[14px]">
                <span className="flex gap-[4px]">
                  <span className="text-fg.1">Difficulty:</span>
                  <span className="text-fg.0">
                    {parseNumberRange(filter.difficultyMin, filter.difficultyMax)}
                  </span>
                </span>
                <Button
                  onClick={() => dispatch(clearDifficulty())}
                  variant="link"
                >
                  <Icon path={mdiClose} size={0.667} />
                </Button>
              </Badge>
            )}
          {filter.instruments.length > 0 && (
            <Badge variant="outline" className="gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.1">Instruments:</span>
                <span className="text-fg.0">
                  {filter.instruments
                    .map((instrument) => instrument.name)
                    .join(", ")}
                </span>
              </span>
              <Button
                onClick={() => dispatch(clearInstruments())}
                variant="link"
              >
                <Icon path={mdiClose} size={0.667} />
              </Button>
            </Badge>
          )}
          {filter.composers.length > 0 && (
            <Badge variant="outline" className="gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.1">Composers:</span>
                <span className="text-fg.0">
                  {filter.composers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <Button
                onClick={() => dispatch(clearRole("composers"))}
                variant="link"
              >
                <Icon path={mdiClose} size={0.667} />
              </Button>
            </Badge>
          )}
          {filter.arrangers.length > 0 && (
            <Badge variant="outline" className="gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.1">Arrangers:</span>
                <span className="text-fg.0">
                  {filter.arrangers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <Button
                onClick={() => dispatch(clearRole("arrangers"))}
                variant="link"
              >
                <Icon path={mdiClose} size={0.667} />
              </Button>
            </Badge>
          )}
          {filter.orchestrators.length > 0 && (
            <Badge variant="outline" className="gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.1">orchestrators:</span>
                <span className="text-fg.0">
                  {filter.orchestrators
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <Button
                onClick={() => dispatch(clearRole("orchestrators"))}
                variant="link"
              >
                <Icon path={mdiClose} size={0.667} />
              </Button>
            </Badge>
          )}
          {filter.transcribers.length > 0 && (
            <Badge variant="outline" className="gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.1">transcribers:</span>
                <span className="text-fg.0">
                  {filter.transcribers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <Button
                onClick={() => dispatch(clearRole("transcribers"))}
                variant="link"
              >
                <Icon path={mdiClose} size={0.667} />
              </Button>
            </Badge>
          )}
          {filter.lyricists.length > 0 && (
            <Badge variant="outline" className="gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.1">lyricists:</span>
                <span className="text-fg.0">
                  {filter.lyricists
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <Button
                onClick={() => dispatch(clearRole("lyricists"))}
                variant="link"
              >
                <Icon path={mdiClose} size={0.667} />
              </Button>
            </Badge>
          )}
          <Button onClick={handleClickResetFilters} className='gap-1'>
            <Icon path={mdiEraser} size={0.667} className="shrink-0" />
            <span>Reset filters</span>
          </Button>
        </div>
        <Separator />
        <table
          ref={tableRef}
          className="flex flex-col flex-grow h-0 overflow-y-auto scrollbar-default"
        >
          <thead className="px-[14px] py-[8px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex gap-[14px]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-body-small-default"
                    style={
                      header.id === "main"
                        ? { width: "100%" }
                        : { width: header.getSize() }
                    }
                  >
                    <button
                      onClick={() => handleClickSortColumn(header.column)}
                      className="w-full flex items-center gap-[8px]"
                    >
                      {header.id !== "main" || isMainTitle
                        ? flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                        : "Composers"}

                      {
                        {
                          asc: (
                            <Icon
                              path={mdiArrowUp}
                              size={0.667}
                              className="shrink-0"
                            />
                          ),
                          desc: (
                            <Icon
                              path={mdiArrowDown}
                              size={0.667}
                              className="shrink-0"
                            />
                          ),
                        }[
                        header.id !== "main" || isMainTitle
                          ? (header.column.getIsSorted() as string)
                          : (table
                            .getColumn("composers")
                            ?.getIsSorted() as string)
                        ]
                      }
                    </button>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <Separator />
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                ref={rowRef}
                key={row.original.id}
                className={classNames(
                  "flex items-center gap-[14px] px-[14px] py-[4px]",
                  selected.includes(index) ? "bg-main-bg.focus" : "hover:bg-main-bg.hover"
                )}
                onClick={(event) => handleClickSelect(event, index)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.column.id}
                    className="h-full"
                    style={
                      cell.column.id === "main"
                        ? { width: "100%" }
                        : { width: cell.column.getSize() }
                    }
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div >
      <Modal
        closeModal={handleCancelDeletePiece}
        isOpen={isConfirmDeletePieceModalOpen}
        onConfirm={handleConfirmDeletePiece}
        cancelText="Cancel"
        title="Are you sure you want to delete this piece?"
        confirmText="Delete"
      >
        This cannot be undone!
      </Modal>
    </>
  );
}
