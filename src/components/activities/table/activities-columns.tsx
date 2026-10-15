import type { Group } from "#/lib/schemas/groups";
import { createAppColumnHelper } from "@/lib/ui/data-table";

const columnHelper = createAppColumnHelper<Group>();

export const groupsColumns = columnHelper.columns([
	columnHelper.accessor((group) => `${group.id}`, {
		id: "id",
		header: "ID",
		cell: (info) => info.getValue(),
		sortFn: "alphanumeric",
	}),
	columnHelper.accessor("name", {
		header: "Nombre",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("description", {
		header: "Descripción",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor((group) => group.users.length, {
		id: "users",
		header: "Usuarios",
		cell: (info) => info.getValue(),
	}),
]);
