import { useQuery } from "@tanstack/react-query";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAllGroups() {
	const { data, error, isError, isLoading, refetch } = useQuery({
		queryKey: queryKeys.groups.all,
		queryFn: () => groupsService.getAll(),
	});

	return { data, error, isError, isLoading, refetch };
}
