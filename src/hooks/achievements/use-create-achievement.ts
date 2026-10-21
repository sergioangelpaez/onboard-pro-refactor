import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAchievementPayload } from "#/lib/schemas/achievements";
import { achievementsService } from "#/lib/services/achievements";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateAchievement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateAchievementPayload) =>
			achievementsService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.achievements.create });
		},
	});
}