import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateUserPayload } from "#/lib/schemas/users";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";

export function useUpdateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			payload: user,
		}: {
			id: string;
			payload: UpdateUserPayload;
		}) => usersService.update(id, user),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
		},
	});
}
