import { useQuery } from "@tanstack/react-query";
import { normalizeAchievementCreateOptions } from "#/lib/schemas/achievements";
import { achievementsService } from "#/lib/services/achievements";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAchievementOptions() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.achievements.options,
		queryFn: async () => {
			const response = await achievementsService.getCreateOptions();
			return normalizeAchievementCreateOptions(response);
		},
	});

	return { data, isLoading, error, refetch };
}
