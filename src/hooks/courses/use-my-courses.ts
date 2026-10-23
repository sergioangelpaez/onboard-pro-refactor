import { useQuery } from "@tanstack/react-query";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

export function useMyCourses() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.courses.mine,
		queryFn: () => coursesService.mine(),
	});

	return { data, isLoading, error, refetch };
}
