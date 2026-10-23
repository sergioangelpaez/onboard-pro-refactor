import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCourseRanking(courseId: string, limite = 3) {
	const { data, isLoading } = useQuery({
		queryKey: queryKeys.gamification.courseRanking(courseId),
		queryFn: () => gamificationService.courseRanking(courseId, limite),
	});

	return { data, isLoading };
}
