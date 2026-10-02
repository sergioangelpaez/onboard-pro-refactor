import { Pencil, Trash } from "lucide-react";
import { useState } from "react";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { User } from "@/lib/schemas/users";
import type { AppRow } from "@/lib/ui/data-table";
import { UserDeleteDialog } from "../user-delete-dialog";
import { UserFormSheet } from "../user-form";

export function UserRowActions({ row }: { row: AppRow<User> }) {
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const actions: RowAction<User>[] = [
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
			<UserFormSheet
				key={row.original.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				user={row.original}
			/>

			<UserDeleteDialog
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				user={row.original}
			/>
		</>
	);
}
