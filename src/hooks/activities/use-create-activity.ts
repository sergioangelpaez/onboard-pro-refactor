import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activitiesService } from "#/lib/services/activities";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateActivity(courseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: activitiesService.create,
		onSuccess: () => {
			// El curso vuelve a pedirse para que la actividad nueva aparezca en su
			// seccion, y el listado general porque la pantalla de la actividad lo usa.
			queryClient.invalidateQueries({
				queryKey: queryKeys.courses.sections(courseId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.activities.all });
		},
	});
}
