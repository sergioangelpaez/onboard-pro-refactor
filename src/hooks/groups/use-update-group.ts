import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateGroupPayload } from "#/lib/schemas/groups";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";

export function useUpdateGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload,
		}: {
			id: string;
			payload: UpdateGroupPayload;
		}) => groupsService.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
		},
	});
}
