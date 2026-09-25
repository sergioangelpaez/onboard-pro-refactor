import { useQuery } from "@tanstack/react-query";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAllCourses() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.courses.all,
		queryFn: () => coursesService.getAll(),
	});

	return { data, isLoading, error, refetch };
}
