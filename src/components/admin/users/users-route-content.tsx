import { Plus, RefreshCw } from "lucide-react";
import type { User } from "#/lib/schemas/users";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { DataTable } from "#/components/shared/table/data-table";
import { Button } from "#/components/ui/button";
import { usersColumns } from "./table/users-columns";

interface UsersRouteContentProps {
	data: User[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
	onCreate: () => void;
}

export function UsersRouteContent({
	data,
	isLoading,
	error,
	refetch,
	onCreate,
}: UsersRouteContentProps) {
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

	return (
		<div>
			<DataTable
				tableKey="users-table"
				columns={usersColumns}
				data={data ?? []}
			/>
			<div className="spacer-md" />
		</div>
	);
}
