import { Plus, RefreshCw } from "lucide-react";
import type { Activity } from "#/lib/schemas/activities";
import { EmptyState } from "../shared/states/empty-state";
import { ErrorState } from "../shared/states/error-state";
import { LoadingState } from "../shared/states/loading-state";
import { DataTable } from "../shared/table/data-table";
import { Button } from "../ui/button";

interface ActivitiesRouteContentProps {
	data: Activity[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
	onCreate: () => void;
}

export function ActivitiesRouteContent({
	data,
	isLoading,
	error,
	refetch,
	onCreate,
}: ActivitiesRouteContentProps) {
	if (isLoading) return <LoadingState message="Cargando actividades..." />;

	if (!data && error) {
		return (
			<ErrorState
				title="Error al cargar las actividades"
				description="Ocurrió un error al intentar cargar las actividades. Por favor, espera unos minutos e inténtalo de nuevo."
				content={
					<Button onClick={() => refetch()}>
						<RefreshCw />
						Recargar
					</Button>
				}
			/>
		);
	}

	if (data && data.length === 0) {
		return (
			<EmptyState
				title="Aún no hay actividades"
				description="Aún no hay actividades para mostrar aquí. Para empezar, crea una nueva actividad."
				content={
					<Button onClick={onCreate}>
						<Plus />
						Crear actividad
					</Button>
				}
			/>
		);
	}

	return (
		<div>
			<DataTable
				tableKey="activities-table"
				columns={activitiesColumns}
				data={data ?? []}
			/>
		</div>
	);
}
