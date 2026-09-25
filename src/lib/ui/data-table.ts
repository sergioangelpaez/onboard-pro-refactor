import { createTableHook } from "@tanstack/react-table";

export const { useAppTable, createAppColumnHelper } = createTableHook({
	features: {},
	debugTable: process.env.NODE_ENV === "development",
});
