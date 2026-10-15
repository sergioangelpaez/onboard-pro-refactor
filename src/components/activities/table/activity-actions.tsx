import { Pencil } from "lucide-react";
import { useState } from "react";
import type { Group } from "#/lib/schemas/groups";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { AppRow } from "@/lib/ui/data-table";
import { ActivityFormSheet } from "../activity-form";

export function ActivityRowActions({ row }: { row: AppRow<Group> }) {
	const [editOpen, setEditOpen] = useState(false);

	const actions: RowAction<Group>[] = [
		{
			label: "Editar",
			icon: <Pencil />,
			onClick: () => setEditOpen(true),
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
		</>
	);
}
