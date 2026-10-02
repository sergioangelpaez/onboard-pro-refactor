import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";

export function useDeleteUser() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string }) => usersService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
		},
	});
}
