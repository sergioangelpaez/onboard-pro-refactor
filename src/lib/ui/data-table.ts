import {
	columnFilteringFeature,
	createFilteredRowModel,
	createPaginatedRowModel,
	createSortedRowModel,
	createTableHook,
	filterFn_includesString,
	globalFilteringFeature,
	type Row,
	type RowData,
	rowPaginationFeature,
	rowSortingFeature,
	sortFn_alphanumeric,
	sortFn_datetime,
	sortFn_text,
	tableFeatures,
} from "@tanstack/react-table";

const features = tableFeatures({
	rowSortingFeature,
	rowPaginationFeature,
	sortedRowModel: createSortedRowModel(),
	paginatedRowModel: createPaginatedRowModel(),
	columnFilteringFeature,
	globalFilteringFeature,
	filteredRowModel: createFilteredRowModel(),
	filterFns: { includesString: filterFn_includesString },
	sortFns: {
		alphanumeric: sortFn_alphanumeric,
		text: sortFn_text,
		datetime: sortFn_datetime,
	},
});

export const { useAppTable, createAppColumnHelper } = createTableHook({
	features,
	debugTable: process.env.NODE_ENV === "development",
});

export type AppTableFeatures = typeof features;
export type AppRow<TData extends RowData> = Row<AppTableFeatures, TData>;
