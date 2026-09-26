import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { LoginFormValues } from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";
import { queryKeys } from "#/lib/utils/query-keys";

export function useLogin() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: LoginFormValues) => authService.logIn(values),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.login }),
	});
}
