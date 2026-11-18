import { LibraryBig, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import type { Group } from "#/lib/schemas/groups";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { GroupAddCoursesDialog } from "#/components/admin/groups/group-add-courses-dialog";
import { GroupDeleteDialog } from "#/components/admin/groups/group-delete-dialog";
import { GroupFormSheet } from "#/components/admin/groups/groups-form";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";

export function GroupRowActions({ row }: { row: AppRow<Group> }) {
	// El superadmin solo consulta: los cambios los hace el admin.
	const soloLectura = useSoloLectura();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [addCoursesOpen, setAddCoursesOpen] = useState(false);

	const actions: RowAction<Group>[] = [
		{
			label: "Agregar Cursos",
			icon: <LibraryBig />,
			onClick: () => setAddCoursesOpen(true),
		},
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

	if (soloLectura) return null;

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

			<GroupAddCoursesDialog
				open={addCoursesOpen}
				onOpenChange={setAddCoursesOpen}
				group={row.original}
			/>
		</>
	);
}
