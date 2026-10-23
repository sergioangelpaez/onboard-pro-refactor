import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

export function useRanking() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.gamification.ranking,
		queryFn: () => gamificationService.ranking(),
	});

	return { data, isLoading, error, refetch };
}
