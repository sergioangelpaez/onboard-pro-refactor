import { useQuery } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAllActivities() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.activities.all,
		queryFn: () => activitiesService.getAll(),
	});

	return { data, isLoading, error, refetch };
}
