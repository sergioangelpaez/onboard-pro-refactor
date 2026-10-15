import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";

export function useDeleteActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string }) => activitiesService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["activities"] });
		},
	});
}
