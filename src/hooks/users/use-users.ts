import { useQuery } from "@tanstack/react-query";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";

export function useUsers() {
	const { data, error, isError, isLoading } = useQuery({
		queryKey: queryKeys.users.all,
		queryFn: () => usersService.getAllUsers(),
	});

	return { data, error, isError, isLoading };
}
