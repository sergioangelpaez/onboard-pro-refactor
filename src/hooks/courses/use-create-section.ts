import { useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateSection(courseId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ name }: { name: string }) =>
			coursesService.createSection(courseId, name),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.sections.byCourse(courseId),
			});
		},
	});
}
