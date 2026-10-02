import type { Row, RowData } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import type { AppTableFeatures } from "#/lib/ui/data-table";
import { Button } from "../../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

export interface RowAction<TData> {
	label: string;
	icon?: React.ReactNode;
	onClick: (item: TData) => void;
	variant?: "default" | "destructive";
}

interface RowActionsProps<TData extends RowData> {
	row: Row<AppTableFeatures, TData>;
	actions: RowAction<TData>[];
}

export function RowActions<TData extends RowData>({
	row,
	actions,
}: RowActionsProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="size-8">
					<MoreHorizontal className="size-4" />
					<span className="sr-only">Abrir acciones</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{actions.map((action) => (
					<DropdownMenuItem
						key={action.label}
						variant={action.variant}
						onClick={() => action.onClick(row.original)}
					>
						{action.icon}
						{action.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
