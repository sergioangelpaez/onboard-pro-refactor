import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { payloadDeLogro } from "#/lib/schemas/achievements";
import { achievementsService } from "#/lib/services/achievements";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateAchievement() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: ReturnType<typeof payloadDeLogro>) =>
			achievementsService.create(payload),
		onSuccess: () => {
			// La lista de logros tiene que mostrar el recién creado.
			queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });
		},
	});
}
