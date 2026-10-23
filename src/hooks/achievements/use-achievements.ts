import { useQuery } from "@tanstack/react-query";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { logrosService } from "#/lib/services/logros";
import { queryKeys } from "#/lib/utils/query-keys";

/**
 * Los logros de la organización más los genéricos, que valen para todas.
 * Para el superadmin, los de la organización que eligió en el menú; sin
 * ninguna elegida, todos.
 */
export function useAchievements() {
	const organizacion = useOrganizacionActiva();
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [...queryKeys.achievements.all, organizacion],
		queryFn: () => logrosService.getAll({ tenantId: organizacion }),
	});

	return { data, isLoading, error, refetch };
}
