import { useQuery } from "@tanstack/react-query";
import {
	gamificationService,
	type PeriodoRanking,
} from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCourseRanking(
	courseId: string,
	limite = 3,
	habilitado = true,
	periodo: PeriodoRanking = "siempre",
) {
	const { data, isLoading, error, refetch } = useQuery({
		enabled: habilitado && !!courseId,
		// El límite y el periodo van en la clave: el top 3 del instructor, la
		// lista completa del curso y la de esta semana son respuestas distintas
		// y no deben pisarse en cache.
		queryKey: [
			...queryKeys.gamification.courseRanking(courseId),
			limite,
			periodo,
		],
		queryFn: () => gamificationService.courseRanking(courseId, limite, periodo),
	});

	return { data, isLoading, error, refetch };
}
