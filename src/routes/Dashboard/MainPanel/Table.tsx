import { Menu } from "@headlessui/react";
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiChevronUp,
  mdiClose,
  mdiDotsHorizontal,
  mdiEraser,
  mdiTag,
} from "@mdi/js";
import { Icon } from "@mdi/react";
import {
  ClickEvent,
  Menu as ContextMenu,
  MenuButton,
  MenuDivider,
  MenuItem,
  SubMenu,
} from "@szhsin/react-menu";
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
import { useAppDispatch, useAppSelector } from "src/app/hooks";
import { Piece } from "src/app/types";
import { isWindows } from "src/app/utils";
import { Modal } from "src/components/Modal";
import {
  clearDifficulty,
  clearInstruments,
  clearParts,
  clearRole,
  clearYearPublished,
  removeTag,
  resetFilter,
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

    if (filter.yearPublishedMin !== 0 || filter.yearPublishedMax !== Infinity) {
      filteringPieces = filteringPieces.filter((piece) => {
        return (
          piece.year_published &&
          piece.year_published >= filter.yearPublishedMin &&
          piece.year_published <= filter.yearPublishedMax
        );
      });
    }

    if (filter.yearPublishedMin !== 0 || filter.yearPublishedMax !== Infinity) {
      filteringPieces = filteringPieces.filter((piece) => {
        return (
          piece.difficulty &&
          piece.difficulty >= filter.difficultyMin &&
          piece.difficulty <= filter.difficultyMax
        );
      });
    }

    if (filter.parts.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.parts.every((part) => {
          return piece.parts.some(
            (piecePart) => piecePart.name.toLowerCase() === part.toLowerCase()
          );
        });
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
          return <span className="text-fg.muted">{id}</span>;
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
                <div className="flex flex-col gap-[8px]">
                  <span className="text-lg text-fg.default">
                    {info.row.original.title}
                  </span>
                  <span className="text-sm text-fg.muted">
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
                    <li
                      className="h-[14px] w-[14px] rounded-[7px]"
                      style={{ backgroundColor: tag.color }}
                    />
                  ))}
                </ol>
              </div>
              <div className="relative">
                <ContextMenu
                  menuButton={
                    <MenuButton onClick={(event) => event.stopPropagation()}>
                      <Icon
                        path={mdiDotsHorizontal}
                        size={1}
                        className="shrink-0 text-fg.muted hover:text-fg.default transition-all"
                      />
                    </MenuButton>
                  }
                >
                  <div className="flex flex-col w-[192px] p-[4px] rounded-[4px] absolute bg-bg.emphasis shadow-float z-10">
                    {isPieceInCurrentSetlist(info.row.original) && (
                      <MenuItem
                        onClick={(event) =>
                          handleClickRemoveFromSetlist(
                            event,
                            info.row.original.id,
                            setlist.setlist!.id
                          )
                        }
                        className="context-menu-item outline-none"
                      >
                        Remove from setlist
                      </MenuItem>
                    )}
                    {isAvailableToAddToSetlist(info.row.original) && (
                      <SubMenu
                        label={
                          <span className="context-menu-item outline-none justify-between">
                            Add to setlist
                            <Icon path={mdiChevronRight} size={1} />
                          </span>
                        }
                      >
                        <div className="flex flex-col w-[192px] p-[4px] rounded-[4px] mx-[4px] bg-bg.emphasis shadow-float z-10">
                          {setlists
                            .filter(
                              (sl) =>
                                !info.row.original.setlists.some(
                                  (pieceSl) => pieceSl.id === sl.id
                                )
                            )
                            .map((sl) => (
                              <MenuItem
                                onClick={(event) =>
                                  handleClickAddToSetlist(
                                    event,
                                    info.row.original.id,
                                    sl.id
                                  )
                                }
                                className="context-menu-item outline-none"
                              >
                                {sl.name}
                              </MenuItem>
                            ))}
                        </div>
                      </SubMenu>
                    )}
                    {(isPieceInCurrentSetlist(info.row.original) ||
                      isAvailableToAddToSetlist(info.row.original)) && (
                      <MenuDivider className="context-menu-divider" />
                    )}
                    <MenuItem
                      onClick={async (event) =>
                        handleClickOpenFolder(event, info.row.original.path)
                      }
                      className="context-menu-item outline-none"
                    >
                      Open folder
                    </MenuItem>
                    <MenuItem
                      onClick={(event) =>
                        handleClickEditPiece(event, info.row.original)
                      }
                      className="context-menu-item outline-none"
                    >
                      Edit data
                    </MenuItem>
                    <MenuItem
                      onClick={(event) =>
                        handleClickPrintParts(event, info.row.original.path)
                      }
                      className="context-menu-item outline-none"
                    >
                      Print parts
                    </MenuItem>
                    <MenuItem
                      onClick={(event) =>
                        handleClickDeletePiece(event, info.row.original.id)
                      }
                      className="context-menu-item outline-none text-danger.default hover:text-danger.emphasis"
                    >
                      Delete
                    </MenuItem>
                  </div>
                </ContextMenu>
              </div>
            </div>
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
          return (
            <span className="text-fg.default">{info.getValue() as number}</span>
          );
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
              return updatedAt.toLocaleString(DateTime.DATE_SHORT);
            } else {
              return updatedAt.toLocaleString(DateTime.DATE_MED);
            }
          })();

          return <span className="text-fg.muted">{formattedUpdatedAt}</span>;
        },
        size: 91,
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

  async function handleClickOpenFolder(event: ClickEvent, path: string) {
    event.syntheticEvent?.stopPropagation();
    await invoke("open", { path });
  }

  function handleClickEditPiece(event: ClickEvent, piece: Piece) {
    event.syntheticEvent?.stopPropagation();
    navigate("/edit-wizard", { state: { piece } });
  }

  function handleClickPrintParts(event: ClickEvent, path: string) {
    event.syntheticEvent?.stopPropagation();
    void path;
  }

  function handleClickDeletePiece(event: ClickEvent, pieceId: number) {
    event.syntheticEvent?.stopPropagation();
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
    event: ClickEvent,
    pieceId: number,
    setlistId: number
  ) {
    event.syntheticEvent?.stopPropagation();
    await invoke("setlists_add_piece", { pieceId, setlistId });
    await fetchPieces();
  }

  async function handleClickRemoveFromSetlist(
    event: ClickEvent,
    pieceId: number,
    setlistId: number
  ) {
    event.syntheticEvent?.stopPropagation();
    await invoke("setlists_remove_piece", { pieceId, setlistId });
    await fetchPieces();
  }

  function parseNumberRange(num1: number, num2: number) {
    if (num1 === 0) {
      return `...${num2}`;
    } else if (num2 === Infinity) {
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
      <div className="p-[14px] flex flex-col gap-[14px] flex-grow">
        <div className="flex gap-[14px] items-center text-fg.muted flex-wrap">
          <Menu as="div" className="relative">
            <Menu.Button className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[4px]">
              <span className="text-fg.default flex items-center">
                {
                  sortOptions.find((option) => option.id === sorting[0].id)
                    ?.label
                }
                {sorting[0].desc ? (
                  <Icon path={mdiChevronDown} size={1} className="shrink-0" />
                ) : (
                  <Icon path={mdiChevronUp} size={1} className="shrink-0" />
                )}
              </span>
            </Menu.Button>
            <Menu.Items
              as="div"
              className="absolute top-[37px] w-[160px] left-0 mt-[8px] z-10 shadow-float bg-bg.default rounded-[4px] px-[14px] py-[8px]"
            >
              {sortOptions.map((option) => (
                <Menu.Item key={option.id}>
                  <button
                    className="flex justify-between items-center gap-[4px] w-full text-fg.muted hover:text-fg.default"
                    onClick={() => handleClickDropdownSelect(option.id)}
                  >
                    {option.label}
                    {sorting[0].id === option.id ? (
                      <Icon
                        path={sorting[0].desc ? mdiChevronDown : mdiChevronUp}
                        size={1}
                        className=""
                      />
                    ) : (
                      <span className="w-[14px]" />
                    )}
                  </button>
                </Menu.Item>
              ))}
            </Menu.Items>
          </Menu>
          {filter.tags.length > 0 &&
            filter.tags.map((tag) => (
              <div
                key={tag.id}
                className="rounded-[4px] bg-bg.default text-fg.default px-[14px] py-[8px] shadow-float flex gap-[14px]"
              >
                <Icon path={mdiTag} size={1} style={{ color: tag.color }} />
                {tag.name}
                <button
                  onClick={() => dispatch(removeTag(tag.id))}
                  className="text-fg.muted transition-all hover:text-fg.default"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>
            ))}
          {(filter.yearPublishedMin !== 0 ||
            filter.yearPublishedMax !== Infinity) && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Published:</span>
                <span className="text-fg.default">
                  {parseNumberRange(
                    filter.yearPublishedMin,
                    filter.yearPublishedMax
                  )}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearYearPublished())}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {(filter.difficultyMin !== 0 ||
            filter.difficultyMax !== Infinity) && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Difficulty:</span>
                <span className="text-fg.default">
                  {parseNumberRange(filter.difficultyMin, filter.difficultyMax)}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearDifficulty())}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.parts.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Parts:</span>
                <span className="text-fg.default">
                  {filter.parts.join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearParts())}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.instruments.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Instruments:</span>
                <span className="text-fg.default">
                  {filter.instruments
                    .map((instrument) => instrument.name)
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearInstruments())}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.composers.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Composers:</span>
                <span className="text-fg.default">
                  {filter.composers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearRole("composers"))}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.composers.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Composers:</span>
                <span className="text-fg.default">
                  {filter.composers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearRole("composers"))}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.arrangers.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Arrangers:</span>
                <span className="text-fg.default">
                  {filter.arrangers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearRole("arrangers"))}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.orchestrators.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Orchestrators:</span>
                <span className="text-fg.default">
                  {filter.orchestrators
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearRole("orchestrators"))}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.transcribers.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Transcribers:</span>
                <span className="text-fg.default">
                  {filter.transcribers
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearRole("transcribers"))}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          {filter.lyricists.length > 0 && (
            <div className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[14px]">
              <span className="flex gap-[4px]">
                <span className="text-fg.muted">Lyricists:</span>
                <span className="text-fg.default">
                  {filter.lyricists
                    .map((musician) =>
                      musician.last_name
                        ? `${musician.first_name} ${musician.last_name}`
                        : musician.first_name
                    )
                    .join(", ")}
                </span>
              </span>
              <button
                onClick={() => dispatch(clearRole("lyricists"))}
                className="text-fg.muted transition-all hover:text-fg.default"
              >
                <Icon path={mdiClose} size={1} />
              </button>
            </div>
          )}
          <button
            className="flex gap-[8px] hover:text-fg.default"
            onClick={handleClickResetFilters}
          >
            <Icon path={mdiEraser} size={1} className="shrink-0" />
            <span>Reset filters</span>
          </button>
        </div>
        <table
          ref={tableRef}
          className="flex flex-col gap-[14px] flex-grow h-0 overflow-y-auto scrollbar-default"
        >
          <thead className="pb-[14px] border-b-fg.subtle border-b px-[14px]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="flex gap-[14px]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-fg.muted font-medium hover:text-fg.default"
                    style={
                      header.id === "main"
                        ? { flexGrow: 1 }
                        : { width: header.getSize() }
                    }
                  >
                    <button
                      onClick={() => handleClickSortColumn(header.column)}
                      className="w-full flex"
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
                              path={mdiChevronUp}
                              size={1}
                              className="shrink-0"
                            />
                          ),
                          desc: (
                            <Icon
                              path={mdiChevronDown}
                              size={1}
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
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                ref={rowRef}
                key={row.original.id}
                className={classNames(
                  "flex items-center  gap-[14px] px-[14px]",
                  selected.includes(index)
                    ? "bg-bg.emphasis"
                    : "hover:bg-bg.default"
                )}
                onClick={(event) => handleClickSelect(event, index)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.column.id}
                    className="h-full"
                    style={
                      cell.column.id === "main"
                        ? { flexGrow: 1 }
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
      </div>
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
