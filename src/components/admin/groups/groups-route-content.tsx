import { Plus, RefreshCw } from "lucide-react";
import type { Group } from "#/lib/schemas/groups";
import { EmptyState } from "../../shared/states/empty-state";
import { ErrorState } from "../../shared/states/error-state";
import { LoadingState } from "../../shared/states/loading-state";
import { DataTable } from "../../shared/table/data-table";
import { Button } from "../../ui/button";
import { groupsColumns } from "./table/groups-columns";

interface GroupsRouteContentProps {
	data: Group[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
	onCreate: () => void;
}

export function GroupsRouteContent({
	data,
	isLoading,
	error,
	refetch,
	onCreate,
}: GroupsRouteContentProps) {
	if (isLoading) return <LoadingState message="Cargando grupos..." />;

	if (!data && error)
		return (
			<ErrorState
				title="Error al cargar los grupos"
				description="Ocurrió un error al intentar cargar los grupos. Por favor, espera unos minutos e inténtalo de nuevo."
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
				title="Aún no hay grupos"
				description="Aún no hay grupos para mostrar aquí. Para empezar, crea un nuevo grupo."
				content={
					<Button onClick={onCreate}>
						<Plus />
						Crear grupo
					</Button>
				}
			/>
		);

	return (
		<div>
			<DataTable
				tableKey="groups-table"
				columns={groupsColumns}
				data={data ?? []}
			/>
			<div className="spacer-md" />
		</div>
	);
}
