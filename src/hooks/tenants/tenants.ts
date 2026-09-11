import { useQuery } from "@tanstack/react-query";
import { getAllTenantsFn } from "#/lib/services/organizations/functions";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAllOrganizations() {
	const { data, error, isError, isLoading } = useQuery({
		queryKey: queryKeys.tenants.all,
		queryFn: getAllTenantsFn,
	});

	return { data, error, isError, isLoading };
}
