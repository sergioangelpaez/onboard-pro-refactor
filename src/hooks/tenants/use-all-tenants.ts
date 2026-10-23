import { useQuery } from "@tanstack/react-query";
import { tenantsService } from "#/lib/services/tenants";
import { queryKeys } from "#/lib/utils/query-keys";

/** `habilitado` en false no consulta: la ruta es solo del superadmin y a otro rol le responde 403. */
export function useAllTenants(habilitado = true) {
	const { data, error, isError, isLoading, refetch } = useQuery({
		queryKey: queryKeys.tenants.all,
		queryFn: tenantsService.getAllTenants,
		enabled: habilitado,
	});

	return { data, error, isError, isLoading, refetch };
}
