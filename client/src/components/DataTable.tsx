import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import React, { useCallback, useMemo } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading: boolean;
  error: Error | null;
  searchPlaceholder: string;
  filterableColumns?: string[];
  filterAction?: React.ReactNode;
  serverSidePagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  error,
  searchPlaceholder,
  filterableColumns,
  filterAction,
  serverSidePagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSearchChange,
  searchValue,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: serverSidePagination
      ? undefined
      : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    manualPagination: serverSidePagination,
  });

  const handleFilterChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;

      if (serverSidePagination && onSearchChange) {
        onSearchChange(value);
      } else if (filterableColumns && filterableColumns.length > 0) {
        const newFilters = filterableColumns.map((columnId) => ({
          id: columnId,
          value: value,
        }));
        setColumnFilters(newFilters);
      }
    },
    [filterableColumns, serverSidePagination, onSearchChange]
  );

  const handlePreviousPage = useCallback(() => {
    if (serverSidePagination && onPageChange) {
      onPageChange(Math.max(1, currentPage - 1));
    } else {
      table.previousPage();
    }
  }, [serverSidePagination, onPageChange, currentPage, table]);

  const handleNextPage = useCallback(() => {
    if (serverSidePagination && onPageChange) {
      onPageChange(Math.min(totalPages, currentPage + 1));
    } else {
      table.nextPage();
    }
  }, [serverSidePagination, onPageChange, currentPage, totalPages, table]);

  const canPreviousPage = useMemo(() => {
    return serverSidePagination ? currentPage > 1 : table.getCanPreviousPage();
  }, [serverSidePagination, currentPage, table]);

  const canNextPage = useMemo(() => {
    return serverSidePagination
      ? currentPage < totalPages
      : table.getCanNextPage();
  }, [serverSidePagination, currentPage, totalPages, table]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2 items-center">
        <Input
          placeholder={searchPlaceholder}
          startIcon={<SearchIcon className="w-4 h-4" />}
          id="search-input"
          className="flex-1"
          value={
            serverSidePagination
              ? (searchValue ?? "")
              : (columnFilters[0]?.value as string)
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
                                  asc: <ArrowUpIcon className="w-4 h-4" />,
                                  desc: <ArrowDownIcon className="w-4 h-4" />,
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
                // eslint-disable-next-line react/no-array-index-key
                <TableRow key={index}>
                  {columns.map((_, colIndex) => (
                    // eslint-disable-next-line react/no-array-index-key
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
              onClick={handlePreviousPage}
              disabled={!canPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!canNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
