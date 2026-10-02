import { Pencil } from "lucide-react";
import { useState } from "react";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { User } from "@/lib/schemas/users";
import type { AppRow } from "@/lib/ui/data-table";
import { UserFormSheet } from "../user-form";

export function UserRowActions({ row }: { row: AppRow<User> }) {
	const [open, setOpen] = useState(false);

	const actions: RowAction<User>[] = [
		{
			label: "Editar",
			icon: <Pencil />,
			onClick: () => setOpen(true),
		},
	];

	return (
		<>
			<RowActions row={row} actions={actions} />
			<UserFormSheet
				key={row.original.id}
				open={open}
				onOpenChange={setOpen}
				user={row.original}
			/>
		</>
	);
}
