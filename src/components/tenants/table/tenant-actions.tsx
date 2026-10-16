import { Pencil } from "lucide-react";
import { useState } from "react";
import type { Tenant } from "#/lib/schemas/tenants";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { TenantFormSheet } from "../tenants-form";

export function TenantRowActions({ row }: { row: AppRow<Tenant> }) {
	const [editOpen, setEditOpen] = useState(false);

	const actions: RowAction<Tenant>[] = [
		{
			label: "Editar",
			icon: <Pencil />,
			onClick: () => setEditOpen(true),
		},
	];

	return (
		<>
			<RowActions row={row} actions={actions} />
			<TenantFormSheet
				key={row.original.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				tenant={row.original}
			/>
		</>
	);
}
