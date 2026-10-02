import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { Group } from "#/lib/schemas/groups";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { GroupDeleteDialog } from "../group-delete-dialog";
import { GroupFormSheet } from "../groups-form";

export function GroupRowActions({ row }: { row: AppRow<Group> }) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const actions: RowAction<Group>[] = [
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
			<GroupFormSheet
				key={row.original.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				group={row.original}
			/>

			<GroupDeleteDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				group={row.original}
			/>
		</>
	);
}
