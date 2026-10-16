import { useQuery } from "@tanstack/react-query";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";

export function useMyGroups() {
	const { data, error, isError, isLoading, refetch } = useQuery({
		queryKey: queryKeys.groups.mine,
		queryFn: () => groupsService.getMine(),
	});

	return { data, error, isError, isLoading, refetch };
}
