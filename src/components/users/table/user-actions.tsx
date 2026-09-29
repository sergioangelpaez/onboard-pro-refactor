import { useNavigate } from "@tanstack/react-router";
import { Pencil } from "lucide-react";
import {
	type RowAction,
	RowActions,
} from "@/components/shared/table/row-actions";
import type { User } from "@/lib/schemas/users";
import type { AppRow } from "@/lib/ui/data-table";
import { CreateUserDialogForm } from "../create-user-dialog-form";

export function UserRowActions({ row }: { row: AppRow<User> }) {
	const navigate = useNavigate();

	const actions: RowAction<User>[] = [
		{
			label: "Editar",
			icon: <Pencil />,
			onClick: () => <CreateUserDialogForm />,
		},
	];

	return <RowActions row={row} actions={actions} />;
}
