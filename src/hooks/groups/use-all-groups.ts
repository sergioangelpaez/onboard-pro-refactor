import { useQuery } from "@tanstack/react-query";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";
import { deLaOrganizacion } from "#/lib/utils/tenant-activo";

export function useAllGroups() {
	// El superadmin ve solo la organización que eligió en el menú.
	const organizacion = useOrganizacionActiva();
	const { data, error, isError, isLoading, refetch } = useQuery({
		queryKey: queryKeys.groups.all,
		queryFn: () => groupsService.getAll(),
	});

	return {
		data: deLaOrganizacion(data, organizacion),
		error,
		isError,
		isLoading,
		refetch,
	};
}
