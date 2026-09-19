import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateUserPayload } from "#/lib/schemas/users";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateUserPayload) =>
			usersService.createUser(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.create });
		},
	});
}
