import { useAppDispatch, useAppSelector } from "@/app/hooks";
import {
  openFolder,
  openWizard,
  piecesDelete,
  piecesGetAll,
  piecesGetBySetlist,
  setlistsAddPiece,
  setlistsRemovePiece,
} from "@/app/invokers";
import { Piece, Tag } from "@/app/types";
import { cn, isWindows } from "@/app/utils";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  mdiArrowDown,
  mdiArrowUp,
  mdiDotsHorizontal
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
import { listen } from "@tauri-apps/api/event";
import { useMachine } from "@xstate/react";
import dayjs from "dayjs";
import Fuse from "fuse.js";
import {
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  pushTag
} from "../../reducers/filterSlice";
import { setPieces } from "../../reducers/piecesSlice";
import { clearPiece, setPiece } from "../../reducers/previewSlice";
import { mainSortMachine } from "../mainSortMachine";
import { FilterBar } from "../FilterBar";

export function Table() {
  const [filteredPieces, setFilteredPieces] = useState<Piece[]>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [isMainTitle, setIsMainTitle] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [anchor, setAnchor] = useState(0);

  const [mainSortState, sendMainSortState] = useMachine(mainSortMachine);

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

    const unlistenRefresh = listen("refresh_dashboard", () => fetchPieces());

    return () => {
      window.removeEventListener("click", handleClick);
      resizeObserver.disconnect();
      unlistenRefresh;
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

    if (
      filter.yearPublishedMin !== undefined ||
      filter.yearPublishedMax !== undefined
    ) {
      filteringPieces = filteringPieces.filter((piece) => {
        return (
          piece.year_published &&
          piece.year_published >= (filter.yearPublishedMin ?? 0) &&
          piece.year_published <= (filter.yearPublishedMax ?? Infinity)
        );
      });
    }

    if (
      filter.difficultyMin !== undefined ||
      filter.difficultyMax !== undefined
    ) {
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
              (piecePartInstrument) => piecePartInstrument.id === instrument.id,
            );
          });
        });
      });
    }

    if (filter.composers.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.composers.every((composer) => {
          return piece.composers.some(
            (pieceComposer) => pieceComposer.id === composer.id,
          );
        });
      });
    }

    if (filter.arrangers.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.arrangers.every((arranger) => {
          return piece.arrangers.some(
            (pieceArranger) => pieceArranger.id === arranger.id,
          );
        });
      });
    }

    if (filter.orchestrators.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.orchestrators.every((orchestrator) => {
          return piece.orchestrators.some(
            (pieceOrchestrator) => pieceOrchestrator.id === orchestrator.id,
          );
        });
      });
    }

    if (filter.transcribers.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.transcribers.every((transcriber) => {
          return piece.transcribers.some(
            (pieceTranscriber) => pieceTranscriber.id === transcriber.id,
          );
        });
      });
    }

    if (filter.lyricists.length > 0) {
      filteringPieces = filteringPieces.filter((piece) => {
        return filter.lyricists.every((lyricist) => {
          return piece.lyricists.some(
            (pieceLyricist) => pieceLyricist.id === lyricist.id,
          );
        });
      });
    }

    setFilteredPieces(filteringPieces);
  }, [query, filter, pieces]);

  const columns = useMemo<ColumnDef<Piece>[]>(
    () => [
      {
        id: "main",
        accessorFn: (row) => row.title,
        header: () => {
          return <span className="text-left">Title</span>;
        },
        cell: (info) => (
          <div className="flex gap-[14px] items-center justify-between">
            <div className="flex gap-[14px] items-center">
              <div className="flex flex-col">
                <span className="text-body-default text-fg.0 font-bold">
                  {info.row.original.title}
                </span>
                <span className="text-body-small-default">
                  {info.row.original.composers
                    .map((composer) =>
                      composer.last_name
                        ? `${composer.first_name} ${composer.last_name}`
                        : `${composer.first_name}`,
                    )
                    .join(", ")}
                </span>
              </div>
              <ol className="flex gap-[4px]">
                {info.row.original.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="gap-[4px] hover:text-fg.0 hover:border-divider.focus"
                    onClick={() => handleClickPushTag(tag)}
                  >
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
              <DropdownMenuContent>
                {isPieceInCurrentSetlist(info.row.original) && (
                  <DropdownMenuItem
                    onClick={() =>
                      handleClickRemoveFromSetlist(
                        info.row.original.id,
                        setlist.setlist!.id,
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
                                (pieceSl) => pieceSl.id === sl.id,
                              ),
                          )
                          .map((sl) => (
                            <DropdownMenuItem
                              key={sl.id}
                              onClick={() =>
                                handleClickAddToSetlist(
                                  info.row.original.id,
                                  sl.id,
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
                  onClick={() => handleClickEditPiece(info.row.original)}
                >
                  Edit data
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleClickPrintPiece(info.row.original.id)}
                >
                  Print piece
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger onClick={(e) => e.stopPropagation()}>
                      Delete
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you sure you want to delete this piece?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This cannot be undone!
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <Button
                          onClick={() =>
                            handleClickDeletePiece(info.row.original.id)
                          }
                        >
                          Delete
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
      {
        id: "composers",
        accessorFn: (row) => {
          const { composers } = row;
          return composers
            .map((composer) =>
              composer.last_name
                ? `${composer.last_name}, ${composer.first_name}`
                : `${composer.first_name}`,
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
        accessorFn: (row) => dayjs(row.updated_at),
        header: () => <span className="">Updated</span>,
        cell: (info) => {
          const updatedAt = info.getValue() as dayjs.Dayjs;

          const formattedUpdatedAt = (() => {
            if (updatedAt.isSame(dayjs(), "day")) {
              return updatedAt.format("h:mm A");
            } else if (updatedAt.isSame(dayjs(), "year")) {
              return updatedAt.format("MMM D");
            } else {
              return updatedAt.format("MMM D, YYYY");
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
    [setlist.setlist, setlists],
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
        return await piecesGetBySetlist({ setlistId: setlist.setlist.id });
      } else {
        return await piecesGetAll();
      }
    })();
    dispatch(setPieces({ pieces }));
  }

  async function handleClickSelect(
    event: MouseEvent<HTMLTableRowElement>,
    index: number,
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
      setPiece({ piece: table.getRowModel().rows[index].original as Piece }),
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

  async function handleClickOpenFolder(path: string) {
    await openFolder({ path });
  }

  async function handleClickEditPiece(piece: Piece) {
    await openWizard({ pieceId: piece.id });
  }

  function handleClickPrintPiece(pieceId: number) {
    void pieceId;
  }

  async function handleClickDeletePiece(pieceId: number) {
    await piecesDelete({ id: pieceId });
    if (preview.piece!.id === pieceId) {
      dispatch(clearPiece());
    }
    await fetchPieces();
  }

  async function handleClickAddToSetlist(pieceId: number, setlistId: number) {
    await setlistsAddPiece({ pieceId, setlistId });
    await fetchPieces();
  }

  async function handleClickRemoveFromSetlist(
    pieceId: number,
    setlistId: number,
  ) {
    await setlistsRemovePiece({ pieceId, setlistId });
    await fetchPieces();
  }

  const isPieceInCurrentSetlist = useCallback(
    (piece: Piece) => {
      if (!setlist.setlist) return false;
      return piece.setlists.some((sl) => sl.id === setlist.setlist!.id);
    },
    [setlist.setlist, setlists],
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
    [setlist.setlist, setlists],
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
    <div className="flex flex-col flex-grow">
      <FilterBar setIsMainTitle={setIsMainTitle} />
      <table
        ref={tableRef}
        className="flex flex-col flex-grow h-0 overflow-y-auto scrollbar-default border-t border-divider.default"
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
                        header.getContext(),
                      )
                      : "Composers"}

                    {
                      {
                        asc: (
                          <Icon
                            path={mdiArrowUp}
                            size={2 / 3}
                            className="shrink-0"
                          />
                        ),
                        desc: (
                          <Icon
                            path={mdiArrowDown}
                            size={2 / 3}
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
              className={cn(
                "flex items-center gap-[14px] px-[14px] py-[4px]",
                selected.includes(index)
                  ? "bg-main-bg.focus"
                  : "hover:bg-main-bg.hover",
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
    </div>
  );
}
