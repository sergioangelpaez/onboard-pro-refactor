import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

export function useMyPending() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.gamification.pending,
		queryFn: () => gamificationService.pending(),
	});

	return { data, isLoading, error, refetch };
}
