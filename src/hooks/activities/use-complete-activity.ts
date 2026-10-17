import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCompleteActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => activitiesService.complete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
		},
	});
}
