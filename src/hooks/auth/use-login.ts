import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginFormValues } from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";
import { currentUserQueryOptions } from "#/lib/utils/auth/session";

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: LoginFormValues) => authService.logIn(values),
		onSuccess: ({ user }) => {
			queryClient.setQueryData(currentUserQueryOptions.queryKey, user);
		},
	});
}
