import type { RowData } from "@tanstack/react-table";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useAppTable } from "@/lib/ui/data-table";

interface DataTableProps<TData extends RowData> {
	tableKey: string;
	columns: Parameters<typeof useAppTable<TData>>[0]["columns"];
	data: TData[];
	emptyMessage?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function getVisiblePages(
	pageIndex: number,
	pageCount: number,
): (number | "ellipsis")[] {
	if (pageCount <= 7) {
		return Array.from({ length: pageCount }, (_, i) => i);
	}

	const pages = new Set<number>([
		0,
		pageCount - 1,
		pageIndex - 1,
		pageIndex,
		pageIndex + 1,
	]);
	const sorted = [...pages]
		.filter((p) => p >= 0 && p < pageCount)
		.sort((a, b) => a - b);

	const result: (number | "ellipsis")[] = [];

	sorted.forEach((page, i) => {
		if (i > 0 && page - sorted[i - 1] > 1) result.push("ellipsis");
		result.push(page);
	});

	return result;
}

export function DataTable<TData extends RowData>({
	tableKey,
	columns,
	data,
	emptyMessage = "Sin resultados.",
}: DataTableProps<TData>) {
	const table = useAppTable({
		key: tableKey,
		columns,
		data,
	});

	const { pageIndex, pageSize } = table.state.pagination;
	const pageCount = table.getPageCount();
	const visiblePages = getVisiblePages(pageIndex, pageCount);

	return (
		<div className="flex flex-col gap-4">
			<Input
				value={table.state.globalFilter ?? ""}
				onChange={(e) => table.setGlobalFilter(String(e.target.value))}
				placeholder="Search..."
			/>
			<div className="overflow-hidden rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder ? null : (
											<div
												className="flex items-center gap-2"
												style={{
													cursor: header.column.getCanSort()
														? "pointer"
														: undefined,
												}}
												onClick={header.column.getToggleSortingHandler()}
											>
												<table.FlexRender header={header} />
												{{
													asc: <ArrowUp className="inline-block h-4 w-4" />,
													desc: <ArrowDown className="inline-block h-4 w-4" />,
												}[header.column.getIsSorted() as string] ?? null}
											</div>
										)}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id}>
									{row.getAllCells().map((cell) => (
										<TableCell key={cell.id}>
											<table.FlexRender cell={cell} />
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-muted-foreground"
								>
									{emptyMessage}
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between">
				<Field orientation="horizontal" className="w-fit">
					<FieldLabel htmlFor="select-rows-per-page">
						Filas por página
					</FieldLabel>
					<Select
						value={String(pageSize)}
						onValueChange={(value) => table.setPageSize(Number(value))}
					>
						<SelectTrigger className="w-20" id="select-rows-per-page">
							<SelectValue />
						</SelectTrigger>
						<SelectContent align="start">
							<SelectGroup>
								{PAGE_SIZE_OPTIONS.map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field>

				<Pagination className="mx-0 w-fit">
					<PaginationContent>
						<PaginationItem>
							<PaginationPrevious
								onClick={() => table.previousPage()}
								aria-disabled={!table.getCanPreviousPage()}
								className={
									!table.getCanPreviousPage()
										? "pointer-events-none opacity-50"
										: undefined
								}
							/>
						</PaginationItem>

						{visiblePages.map((page, i) =>
							page === "ellipsis" ? (
								<PaginationItem key={`ellipsis-${i}`}>
									<PaginationEllipsis />
								</PaginationItem>
							) : (
								<PaginationItem key={page}>
									<PaginationLink
										className="cursor-pointer"
										isActive={pageIndex === page}
										onClick={() => table.setPageIndex(page)}
									>
										{page + 1}
									</PaginationLink>
								</PaginationItem>
							),
						)}

						<PaginationItem>
							<PaginationNext
								onClick={() => table.nextPage()}
								aria-disabled={!table.getCanNextPage()}
								className={
									!table.getCanNextPage()
										? "pointer-events-none opacity-50"
										: undefined
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</div>
		</div>
	);
}
