import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCourseRanking(
	courseId: string,
	limite = 3,
	habilitado = true,
) {
	const { data, isLoading } = useQuery({
		enabled: habilitado && !!courseId,
		// El límite va en la clave: el top 3 del instructor y la lista completa
		// del curso son respuestas distintas y no deben pisarse en cache.
		queryKey: [...queryKeys.gamification.courseRanking(courseId), limite],
		queryFn: () => gamificationService.courseRanking(courseId, limite),
	});

	return { data, isLoading };
}
