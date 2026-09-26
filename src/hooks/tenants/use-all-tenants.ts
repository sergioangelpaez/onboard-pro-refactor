import { useQuery } from "@tanstack/react-query";
import { tenantsService } from "#/lib/services/tenants";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAllTenants() {
	const { data, error, isError, isLoading } = useQuery({
		queryKey: queryKeys.tenants.all,
		queryFn: tenantsService.getAllTenants,
	});

	return { data, error, isError, isLoading };
}
