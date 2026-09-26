import type { User } from "@/lib/schemas/users";
import { createAppColumnHelper } from "@/lib/ui/data-table";
import { Badge } from "../ui/badge";

const columnHelper = createAppColumnHelper<User>();

const STATUS_LABELS: Record<User["status"], string> = {
	Active: "Activo",
	Inactive: "Inactivo",
	Pending: "Pendiente",
	Suspended: "Suspendido",
};

const ROLE_LABELS: Record<string, string> = {
	student: "Estudiante",
	teacher: "Docente",
	admin: "Administrador",
};

export const usersColumns = columnHelper.columns([
	columnHelper.accessor((user) => `${user.firstname} ${user.lastname}`, {
		id: "fullName",
		header: "Nombre",
		cell: (info) => info.getValue(),
		sortFn: "alphanumeric",
	}),
	columnHelper.accessor("email", {
		header: "Email",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("phonumber", {
		header: "Teléfono",
		cell: (info) => info.getValue() || "—",
	}),
	columnHelper.accessor("role", {
		header: "Rol",
		cell: (info) => ROLE_LABELS[info.getValue()] ?? info.getValue(),
	}),
	columnHelper.accessor("status", {
		header: "Estado",
		cell: (info) => {
			const status = info.getValue();
			const variant =
				status === "Active"
					? "default"
					: status === "Suspended"
						? "destructive"
						: "outline";
			return <Badge variant={variant}>{STATUS_LABELS[status]}</Badge>;
		},
	}),
	columnHelper.accessor("level", {
		header: "Nivel",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("xp", {
		header: "XP",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("streak", {
		header: "Racha",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("average", {
		header: "Promedio",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("missions", {
		header: "Misiones",
		cell: (info) => info.getValue(),
	}),
]);
