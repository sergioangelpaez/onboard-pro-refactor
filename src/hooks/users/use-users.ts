import { useQuery } from "@tanstack/react-query";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAllUsers() {
	const { data, error, isError, isLoading, refetch } = useQuery({
		queryKey: queryKeys.users.all,
		queryFn: () => usersService.getAll(),
	});

	return { data, error, isError, isLoading, refetch };
}
