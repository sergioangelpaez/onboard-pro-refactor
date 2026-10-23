import { useQuery } from "@tanstack/react-query";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";
import { deLaOrganizacion } from "#/lib/utils/tenant-activo";

export function useAllActivities() {
	// El superadmin ve solo la organización que eligió en el menú.
	const organizacion = useOrganizacionActiva();
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.activities.all,
		queryFn: () => activitiesService.getAll(),
	});

	return {
		data: deLaOrganizacion(data, organizacion),
		isLoading,
		error,
		refetch,
	};
}
