import { useQuery } from "@tanstack/react-query";
import { sectionsService } from "#/lib/services/sections";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCourseSections(courseId: string) {
	return useQuery({
		queryKey: queryKeys.sections.byCourse(courseId),
		queryFn: () => sectionsService.getByCourse(courseId),
		enabled: !!courseId,
	});
}
