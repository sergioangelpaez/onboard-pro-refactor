import { ArchiveRestore, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";
import type { Course } from "#/lib/schemas/courses";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { CourseDeleteDialog } from "../course-delete-dialog";
import { CourseFormSheet } from "../course-form-sheet";

export function CourseRowActions({ row }: { row: AppRow<Course> }) {
	// El superadmin solo consulta: los cambios los hace el admin.
	const soloLectura = useSoloLectura();
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);

	const actions: RowAction<Course>[] = [
		{
			label: "Editar",
			icon: <Pencil />,
			onClick: () => setEditOpen(true),
		},
		{
			// El mismo diálogo ofrece archivar (lo recomendado) o eliminar.
			label: row.original.archivado
				? "Desarchivar o eliminar"
				: "Archivar o eliminar",
			icon: row.original.archivado ? <ArchiveRestore /> : <Trash />,
			onClick: () => setDeleteOpen(true),
			variant: "destructive",
		},
	];

	if (soloLectura) return null;

	return (
		<>
			<RowActions row={row} actions={actions} />
			<CourseFormSheet
				key={row.original.id}
				open={editOpen}
				onOpenChange={setEditOpen}
				course={row.original}
			/>
			<CourseDeleteDialog
				key={row.original.id}
				open={deleteOpen}
				onOpenChange={setDeleteOpen}
				course={row.original}
			/>
		</>
	);
}
