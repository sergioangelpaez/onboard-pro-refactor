import { useSuspenseQuery } from "@tanstack/react-query";
import { getMeFn } from "#/lib/services/auth/functions";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCurrentUser() {
	const { data, error, isError, isLoading } = useSuspenseQuery({
		queryKey: queryKeys.users.me,
		queryFn: getMeFn,
		staleTime: 1000 * 60 * 5,
	});

	return { user: data, error, isError, isLoading };
}
