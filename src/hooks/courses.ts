import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateCoursePayload } from "#/lib/schemas/courses";
import { coursesService } from "#/lib/services/courses";

export function useCreateCourse() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (values: CreateCoursePayload) =>
			coursesService.createCourse(values),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["courses"] });
		},
	});
}
