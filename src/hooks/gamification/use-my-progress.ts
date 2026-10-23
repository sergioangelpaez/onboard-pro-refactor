import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

export function useMyProgress() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.gamification.me,
		queryFn: () => gamificationService.myProgress(),
	});

	return { data, isLoading, error, refetch };
}
