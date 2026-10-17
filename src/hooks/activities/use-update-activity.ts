import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateActivityFormValues } from "#/lib/schemas/activities";
import { activitiesService } from "#/lib/services/activities";

export function useUpdateActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			values,
		}: {
			id: string;
			values: UpdateActivityFormValues;
		}) => activitiesService.update(id, values),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
		},
	});
}
