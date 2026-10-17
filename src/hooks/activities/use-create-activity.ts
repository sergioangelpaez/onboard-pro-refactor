import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateActivityFormValues } from "#/lib/schemas/activities";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateActivityFormValues) =>
			activitiesService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
		},
	});
}
