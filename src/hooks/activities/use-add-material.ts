import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAddMaterial(activityId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ file }: { file: File }) =>
			activitiesService.addMaterial(activityId, file),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.activities.materials(activityId),
			});
		},
	});
}
