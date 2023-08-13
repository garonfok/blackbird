import { mdiChevronDown, mdiChevronUp, mdiEraser } from "@mdi/js";
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
import { useEffect, useMemo, useRef, useState } from "react";
import { PieceDetailed } from "../../../app/types";

const sortOptions = [
  { id: "id", label: "#" },
  { id: "main", label: "Title" },
  { id: "composers", label: "Composers" },
  { id: "yearPublished", label: "Year" },
  { id: "updatedAt", label: "Updated" },
];

export function Table() {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [sorting, setSorting] = useState<SortingState>([
    { id: "updatedAt", desc: true },
  ]);
  const [isMainTitle, setIsMainTitle] = useState(true);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLOListElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    table.getColumn("composers")?.toggleVisibility(false);

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

    window.addEventListener("mousedown", (e) => {
      if (
        isSortDropdownOpen &&
        !sortDropdownRef.current?.contains(e.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    });

    return () => {
      window.removeEventListener("mousedown", () => {});
      resizeObserver.disconnect();
    };
  }, []);

  const columns = useMemo<ColumnDef<PieceDetailed>[]>(
    () => [
      {
        accessorFn: (row) => row.id,
        id: "id",
        header: () => <span className="">#</span>,
        cell: (info) => {
          const id = info.getValue() as string;
          return <span className="text-fg.default w-full">{id}</span>;
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
            <div className="flex gap-[14px]">
              <div className="flex flex-col gap-[8px]">
                <span className="text-lg text-white-primary">
                  {info.row.original.title}
                </span>
                <span className="text-sm text-white-secondary">
                  {info.row.original.composers[0].last_name}
                </span>
              </div>
              <ol>
                {info.row.original.tags.map((tag) => (
                  <li
                    className="h-[14px] w-[14px]"
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
        accessorFn: (row) => row.composers,
        sortingFn: (a, b) => {
          const aComposers = a.original.composers;
          const bComposers = b.original.composers;
          for (
            let i = 0;
            i < Math.max(aComposers.length, bComposers.length);
            i++
          ) {
            const aComposer = aComposers[i];
            const bComposer = bComposers[i];

            if (!aComposer) {
              return -1;
            } else if (!bComposer) {
              return 1;
            }

            const aLastName = aComposer.last_name || aComposer.first_name;
            const bLastName = bComposer.last_name || bComposer.first_name;

            if (aLastName < bLastName) {
              return -1;
            } else if (aLastName > bLastName) {
              return 1;
            }
          }

          if (a.original.title < b.original.title) {
            return -1;
          } else if (a.original.title > b.original.title) {
            return 1;
          }
          return a.original.id - b.original.id;
        },
      },
      {
        id: "yearPublished",
        accessorFn: (row) => row.yearPublished,
        header: () => <span className="">Year</span>,
        cell: (info) => {
          const year = info.getValue() as number;
          return <span className="text-fg.default">{year}</span>;
        },
        size: 64,
      },
      {
        id: "updatedAt",
        accessorFn: (row) => row.updatedAt,
        header: () => <span className="">Updated</span>,
        cell: (info) => {
          const updatedAt = info.getValue() as string;
          return <span className="text-fg.default">{updatedAt}</span>;
        },
        size: 91,
      },
    ],
    []
  );
  const table = useReactTable({
    data: [],
    state: { columnVisibility, sorting },
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleClickSortColumn(headerColumn: Column<PieceDetailed, unknown>) {
    if (headerColumn.id !== "main") {
      if (!sorting[0].desc) {
        setSorting([{ id: "updatedAt", desc: true }]);
      } else {
        headerColumn.toggleSorting();
      }
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
    }
  }

  function handleClickDropdownSelect(optionId: string) {
    if (!sorting[0].desc) {
      setSorting([{ id: optionId, desc: true }]);
    } else {
      table.getColumn(optionId)?.toggleSorting();
    }

    setIsSortDropdownOpen(false);
  }

  function handleClickResetFilters() {
    setSorting([{ id: "updatedAt", desc: true }]);
  }

  return (
    <div className="p-[14px] flex flex-col gap-[14px]">
      <div className="flex gap-[14px] items-center text-fg.muted flex-wrap">
        <div className="relative">
          <button
            className="rounded-[4px] bg-bg.default px-[14px] py-[8px] shadow-float flex gap-[4px]"
            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
          >
            <span className="text-fg.default flex items-center">
              {sortOptions.find((option) => option.id === sorting[0].id)?.label}
              {sorting[0].desc ? (
                <Icon path={mdiChevronDown} size={1} className="" />
              ) : (
                <Icon path={mdiChevronUp} size={1} className="" />
              )}
            </span>
          </button>
          {isSortDropdownOpen && (
            <ol
              ref={sortDropdownRef}
              className="absolute top-[37px] w-[160px] left-0 mt-[8px] z-10 shadow-float bg-bg.default rounded-[4px] px-[14px] py-[8px]"
            >
              {sortOptions.map((option) => (
                <li key={option.id}>
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
                </li>
              ))}
            </ol>
          )}
        </div>
        <button
          className="flex gap-[8px] hover:text-fg.default"
          onClick={handleClickResetFilters}
        >
          <Icon path={mdiEraser} size={1} className="shrink-0" />
          <span>Reset filters</span>
        </button>
      </div>
      <table ref={tableRef} className="flex flex-col gap-[14px]">
        <thead className="pb-[14px] border-b-fg.subtle border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="flex">
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
                    className="w-full text-left flex"
                  >
                    {header.id !== "main" || isMainTitle
                      ? flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      : "Composers"}

                    {
                      {
                        asc: <Icon path={mdiChevronUp} size={1} className="" />,
                        desc: (
                          <Icon path={mdiChevronDown} size={1} className="" />
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
        <tbody></tbody>
      </table>
    </div>
  );
}
