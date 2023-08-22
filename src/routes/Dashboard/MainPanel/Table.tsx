import {
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiEraser,
  mdiTag,
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
import { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { Piece } from "../../../app/types";
import { isWindows } from "../../../app/utils";
import { setPiece } from "../reducers/previewSlice";
import { mainSortMachine } from "./mainSortMachine";
import { Menu } from "@headlessui/react";
import { removeTag, resetFilter } from "../reducers/filterSlice";
import { setPieces } from "../reducers/piecesSlice";

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

  const [mainSortState, sendMainSortState] = useMachine(mainSortMachine);

  const tableRef = useRef<HTMLTableElement>(null);
  const rowRef = useRef<HTMLTableRowElement>(null);

  const filter = useAppSelector((state) => state.filter);
  const query = useAppSelector((state) => state.query);
  const tags = useAppSelector((state) => state.tags);
  const pieces = useAppSelector((state) => state.pieces);
  const dispatch = useAppDispatch();

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
  }, [tags]);

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
    []
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
    const pieces = (await invoke("pieces_get_all")) as Piece[];
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
    <div className="p-[14px] flex flex-col gap-[14px]">
      <div className="flex gap-[14px] items-center text-fg.muted flex-wrap">
        <Menu as="div" className="relative">
          <Menu.Button className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[4px]">
            <span className="text-fg.default flex items-center">
              {sortOptions.find((option) => option.id === sorting[0].id)?.label}
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
        <button
          className="flex gap-[8px] hover:text-fg.default"
          onClick={handleClickResetFilters}
        >
          <Icon path={mdiEraser} size={1} className="shrink-0" />
          <span>Reset filters</span>
        </button>
      </div>
      <table ref={tableRef} className="flex flex-col gap-[14px]">
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
  );
}
