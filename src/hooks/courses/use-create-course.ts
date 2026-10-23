import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCoursePayload } from "#/lib/schemas/courses";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateCourse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: CreateCoursePayload) => coursesService.create(values),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.courses.all });
		},
	});
}
