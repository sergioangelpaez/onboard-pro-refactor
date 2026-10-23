import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useDeleteMaterial(activityId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string }) => activitiesService.deleteMaterial(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.activities.materials(activityId),
			});
		},
	});
}
