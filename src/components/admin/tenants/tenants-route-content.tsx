import { Plus, RefreshCcw } from "lucide-react";
import type { Tenant } from "#/lib/schemas/tenants";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { DataTable } from "#/components/shared/table/data-table";
import { Button } from "#/components/ui/button";
import { tenantsColumns } from "./table/tenants-columns";

interface TenantsRouteContent {
	data: Tenant[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
	onCreate: () => void;
}

export function TenantsRouteContent({
	data,
	isLoading,
	error,
	refetch,
	onCreate,
}: TenantsRouteContent) {
	if (isLoading) return <LoadingState message="Cargando organizaciones..." />;

	if (!data && error) {
		return (
			<ErrorState
				title="Error al cargar las organizaciones."
				description="Ocurrió un error el obtener las organizaciones desde el servidor. Espera unos minutos e inténtalo de nuevo."
				content={
					<Button onClick={() => refetch()}>
						<RefreshCcw />
						Reintentar
					</Button>
				}
			/>
		);
	}

	if (data && data.length === 0) {
		return (
			<EmptyState
				title="No hay organizaciones"
				description="No se encontraron organizaciones. Crea una nueva organización para organizar el contenido."
				content={
					<Button onClick={onCreate}>
						<Plus />
						Crear organización
					</Button>
				}
			/>
		);
	}

	return (
		<DataTable
			tableKey="tenants-table"
			columns={tenantsColumns}
			data={data ?? []}
		/>
	);
}
