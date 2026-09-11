import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserFn } from "#/lib/services/users/functions";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateUserPayload) => createUserFn({ data: payload }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.create });
		},
	});
}
