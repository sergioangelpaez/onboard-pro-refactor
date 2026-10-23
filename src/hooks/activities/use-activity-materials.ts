import { useQuery } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useActivityMaterials(activityId: string) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.activities.materials(activityId),
		queryFn: () => activitiesService.getMaterials(activityId),
		// Las URL vienen firmadas y vencen en una hora: no conviene servirlas
		// desde cache mucho despues de pedirlas.
		staleTime: 1000 * 60 * 30,
	});

	return { data, isLoading, error, refetch };
}
