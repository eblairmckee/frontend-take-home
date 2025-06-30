import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, SearchIcon } from "lucide-react";
import React, { useCallback } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  error: Error | null;
  searchPlaceholder: string;
  globalFilterEnabled?: boolean;
  filterableColumns?: string[]; // Column IDs that should have individual filters
  filterAction?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  error,
  searchPlaceholder,
  globalFilterEnabled = false,
  filterableColumns,
  filterAction,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    globalFilterFn: globalFilterEnabled
      ? (row, _, filterValue) => {
          return row.getVisibleCells().some((cell) => {
            const cellValue = cell.getValue();
            if (cellValue == null) return false;
            return String(cellValue)
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          });
        }
      : undefined,
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (globalFilterEnabled) {
        setGlobalFilter(value);
      } else if (filterableColumns && filterableColumns.length > 0) {
        // Apply the same filter value to all specified filterable columns
        const newFilters = filterableColumns.map((columnId) => ({
          id: columnId,
          value: value,
        }));
        setColumnFilters(newFilters);
      }
    },
    [globalFilterEnabled, filterableColumns]
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center">
        <p className="text-destructive font-medium">Error loading data</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <Input
          placeholder={searchPlaceholder}
          startIcon={<SearchIcon className="w-4 h-4" />}
          className="flex-1"
          value={
            globalFilterEnabled
              ? (globalFilter ?? "")
              : ((columnFilters[0]?.value as string) ?? "")
          }
          onChange={handleFilterChange}
        />
        {filterAction}
      </div>
      <div className="rounded-md border border-secondary-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none flex items-center gap-1 hover:text-foreground"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-muted-foreground">
                              {
                                {
                                  asc: <ArrowUpIcon />,
                                  desc: <ArrowDownIcon />,
                                }[header.column.getIsSorted() as string]
                              }
                            </span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-6 w-1/2 my-1.5 mx-2" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end w-full border-t border-secondary-border py-2 px-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
