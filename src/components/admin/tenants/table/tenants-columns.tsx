import { Badge } from "#/components/ui/badge";
import type { Tenant } from "#/lib/schemas/tenants";
import { createAppColumnHelper } from "@/lib/ui/data-table";
import { TenantRowActions } from "./tenant-actions";

const columnHelper = createAppColumnHelper<Tenant>();

export const tenantsColumns = columnHelper.columns([
	columnHelper.accessor((tenant) => `${tenant.id}`, {
		id: "id",
		header: "ID",
		cell: (info) => info.getValue(),
		sortFn: "alphanumeric",
	}),
	columnHelper.accessor("name", {
		header: "Nombre",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("domain", {
		header: "Dominio",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("active", {
		header: "Activa",
		cell: (info) => {
			return <Badge>{info.getValue() ? "Sí" : "No"}</Badge>;
		},
	}),
	columnHelper.display({
		id: "actions",
		header: "Acciones",
		cell: (info) => {
			return <TenantRowActions row={info.row} />;
		},
	}),
]);
