import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateGroupPayload } from "#/lib/schemas/groups";
import { groupsService } from "#/lib/services/groups";

export function useCreateGroup() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: CreateGroupPayload) =>
			groupsService.createGroup(values),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["groups"] });
		},
	});
}
