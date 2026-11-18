import { Badge } from "#/components/ui/badge";
import { haceCuantoDia } from "#/lib/utils/fechas";
import type { User } from "@/lib/schemas/users";
import { createAppColumnHelper } from "@/lib/ui/data-table";
import { ETIQUETA_ESTADO, etiquetaRol, varianteEstado } from "../etiquetas";
import { UserRowActions } from "./user-actions";

const columnHelper = createAppColumnHelper<User>();

/**
 * La tabla muestra lo que sirve para cualquier rol: quién es, qué rol tiene,
 * si está activo y cuándo usó la plataforma por última vez. Nivel, XP, racha
 * y promedio solo tienen sentido para un aprendiz: están en el panel de
 * detalle que se abre al hacer clic en la fila.
 */
export const usersColumns = columnHelper.columns([
	columnHelper.accessor((user) => `${user.firstname} ${user.lastname}`, {
		id: "fullName",
		header: "Nombre",
		cell: (info) => <span className="font-medium">{info.getValue()}</span>,
		sortFn: "alphanumeric",
	}),
	columnHelper.accessor("email", {
		header: "Correo",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("phonumber", {
		header: "Teléfono",
		cell: (info) => info.getValue() || "—",
	}),
	columnHelper.accessor((user) => etiquetaRol(user.role), {
		id: "role",
		header: "Rol",
		cell: (info) => info.getValue(),
	}),
	columnHelper.accessor("status", {
		header: "Estado",
		cell: (info) => {
			const status = info.getValue();
			return (
				<Badge variant={varianteEstado(status)}>
					{ETIQUETA_ESTADO[status]}
				</Badge>
			);
		},
	}),
	// El texto ordena bien porque es "YYYY-MM-DD"; "nunca" queda vacío.
	columnHelper.accessor((user) => user.ultimaConexion ?? "", {
		id: "ultimaConexion",
		header: "Última conexión",
		cell: (info) => {
			const dia = info.getValue();
			return dia ? (
				<span className="first-letter:uppercase">{haceCuantoDia(dia)}</span>
			) : (
				<span className="text-muted-foreground">Nunca</span>
			);
		},
	}),
	columnHelper.display({
		id: "actions",
		header: "Acciones",
		// Las acciones no abren el detalle: el clic se queda acá (los menús y
		// diálogos van en portales, pero React igual propaga el evento por el
		// árbol de componentes hasta la fila).
		cell: ({ row }) => (
			// biome-ignore lint/a11y/noStaticElementInteractions: solo frena la propagación hacia la fila
			<div
				onClick={(e) => e.stopPropagation()}
				onKeyDown={(e) => e.stopPropagation()}
			>
				<UserRowActions row={row} />
			</div>
		),
	}),
]);
