import { Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { DataTable } from "#/components/shared/table/data-table";
import { Button } from "#/components/ui/button";
import type { User } from "#/lib/schemas/users";
import { usersColumns } from "./table/users-columns";
import { UserDetailSheet } from "./user-detail-sheet";

interface UsersRouteContentProps {
	data: User[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
	onCreate: () => void;
}

type FiltroRol = "todos" | "student" | "instructor" | "admin";

const FILTROS: { valor: FiltroRol; texto: string }[] = [
	{ valor: "todos", texto: "Todos" },
	{ valor: "student", texto: "Aprendices" },
	{ valor: "instructor", texto: "Instructores" },
	{ valor: "admin", texto: "Administradores" },
];

export function UsersRouteContent({
	data,
	isLoading,
	error,
	refetch,
	onCreate,
}: UsersRouteContentProps) {
	const [rol, setRol] = useState<FiltroRol>("todos");
	// Se guarda el id y no la persona: si se edita desde la fila, el panel
	// muestra los datos nuevos al volver a cargar la lista.
	const [seleccionado, setSeleccionado] = useState<string | null>(null);

	if (isLoading) return <LoadingState message="Cargando usuarios..." />;

	if (!data && error)
		return (
			<ErrorState
				title="Error al cargar los usuarios"
				description="Ocurrió un error al intentar cargar los usuarios. Por favor, espera unos minutos e inténtalo de nuevo."
				content={
					<Button onClick={() => refetch()}>
						<RefreshCw />
						Recargar
					</Button>
				}
			/>
		);

	if (data && data.length === 0)
		return (
			<EmptyState
				title="Aún no hay usuarios"
				description="Aún no hay usuarios para mostrar aquí. Para empezar, crea un nuevo usuario."
				content={
					<Button onClick={onCreate}>
						<Plus />
						Crear usuario
					</Button>
				}
			/>
		);

	const todos = data ?? [];
	const cuantos = (r: FiltroRol) =>
		r === "todos" ? todos.length : todos.filter((u) => u.role === r).length;
	const visibles =
		rol === "todos" ? todos : todos.filter((u) => u.role === rol);
	const persona = todos.find((u) => u.id === seleccionado) ?? null;

	return (
		<div className="space-y-4">
			<div
				role="radiogroup"
				aria-label="Filtrar por rol"
				className="inline-flex flex-wrap rounded-lg border bg-muted/50 p-1"
			>
				{FILTROS.map((f) => (
					// biome-ignore lint/a11y/useSemanticElements: control segmentado, mismo patrón que el resto de los filtros
					<button
						key={f.valor}
						type="button"
						role="radio"
						aria-checked={rol === f.valor}
						onClick={() => setRol(f.valor)}
						className={`rounded-md px-3 py-1.5 font-medium text-sm transition-colors ${
							rol === f.valor
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground"
						}`}
					>
						{f.texto}{" "}
						<span className="text-muted-foreground tabular-nums">
							{cuantos(f.valor)}
						</span>
					</button>
				))}
			</div>

			<DataTable
				// La clave cambia con el filtro para que la paginación vuelva a la
				// primera página en vez de quedar en una que ya no existe.
				tableKey={`users-table-${rol}`}
				columns={usersColumns}
				data={visibles}
				emptyMessage="No hay usuarios con ese rol."
				onRowClick={(u) => setSeleccionado(u.id)}
			/>
			<div className="spacer-md" />

			<UserDetailSheet
				user={persona}
				onOpenChange={(abierto) => {
					if (!abierto) setSeleccionado(null);
				}}
			/>
		</div>
	);
}
