import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "@/lib/services/groups";
import { queryKeys } from "@/lib/utils/query-keys";

export function useDeleteGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string }) => groupsService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
		},
	});
}
