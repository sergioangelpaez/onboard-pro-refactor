import { useSuspenseQuery } from "@tanstack/react-query";
import { authService } from "#/lib/services/auth";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCurrentUser() {
	const { data, error, isError, isLoading } = useSuspenseQuery({
		queryKey: queryKeys.users.me,
		queryFn: authService.getMe,
		staleTime: 1000 * 60 * 5,
	});

	return { user: data, error, isError, isLoading };
}
