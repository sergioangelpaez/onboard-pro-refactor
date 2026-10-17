import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { Activity } from "#/lib/schemas/activities";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { ActivityDeleteDialog } from "../activity-delete-dialog";
import { ActivityFormSheet } from "../activity-form";

export function ActivityRowActions({ row }: { row: AppRow<Activity> }) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const actions: RowAction<Activity>[] = [
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
			<ActivityFormSheet
				key={row.original.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				activity={row.original}
			/>

			<ActivityDeleteDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				activity={row.original}
			/>
		</>
	);
}
