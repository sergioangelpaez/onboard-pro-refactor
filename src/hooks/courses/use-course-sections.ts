import { useQuery } from "@tanstack/react-query";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCourseSections(courseId: string) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.sections.byCourse(courseId),
		queryFn: () => coursesService.getSections(courseId),
	});

	return { data, isLoading, error, refetch };
}
