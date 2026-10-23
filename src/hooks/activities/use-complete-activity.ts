import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCompleteActivity() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => activitiesService.complete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
			// Completar suma XP y cuenta para la racha: el inicio tiene que reflejarlo.
			queryClient.invalidateQueries({ queryKey: queryKeys.gamification.me });
			// Puede haber desbloqueado logros.
			queryClient.invalidateQueries({ queryKey: queryKeys.achievements.mine });
			queryClient.invalidateQueries({
				queryKey: queryKeys.gamification.pending,
			});
			// Las secciones del curso traen qué está completada.
			queryClient.invalidateQueries({ queryKey: ["sections"] });
		},
	});
}
