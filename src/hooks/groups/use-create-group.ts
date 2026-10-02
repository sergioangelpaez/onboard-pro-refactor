import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateGroupPayload } from "#/lib/schemas/groups";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: CreateGroupPayload) => groupsService.create(values),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
		},
	});
}
