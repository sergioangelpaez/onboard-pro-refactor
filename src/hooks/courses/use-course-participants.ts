import { useQuery } from "@tanstack/react-query";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

/** El instructor, los grupos y los aprendices de un curso. */
export function useCourseParticipants(courseId: string) {
	return useQuery({
		queryKey: queryKeys.courses.participants(courseId),
		queryFn: () => coursesService.participants(courseId),
		staleTime: 1000 * 60 * 5,
	});
}
