import { useQuery } from "@tanstack/react-query";
import { logrosService } from "#/lib/services/logros";
import { queryKeys } from "#/lib/utils/query-keys";

export function useMyAchievements() {
	const { data, isLoading, error } = useQuery({
		queryKey: queryKeys.achievements.mine,
		queryFn: () => logrosService.mine(),
	});

	return { data, isLoading, error };
}
