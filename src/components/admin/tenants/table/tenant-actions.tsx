import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { Tenant } from "#/lib/schemas/tenants";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { TenantDeleteDialog } from "#/components/admin/tenants/tenant-delete-dialog";
import { TenantFormSheet } from "#/components/admin/tenants/tenants-form";

export function TenantRowActions({ row }: { row: AppRow<Tenant> }) {
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);

	const actions: RowAction<Tenant>[] = [
		{
			label: "Editar",
			icon: <Pencil />,
			onClick: () => setEditOpen(true),
		},
		{
			label: "Eliminar",
			icon: <Trash />,
			onClick: () => setDeleteOpen(true),
			variant: "destructive",
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

			<TenantDeleteDialog
				key={row.original.id}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				group={row.original}
			/>
		</>
	);
}
