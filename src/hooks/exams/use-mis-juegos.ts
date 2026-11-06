import { useQuery } from "@tanstack/react-query";
import { examsService } from "#/lib/services/exams";
import { queryKeys } from "#/lib/utils/query-keys";

/** Mi historial de juegos: mejor resultado y partidas de cada concurso. */
export function useMisJuegos() {
	return useQuery({
		queryKey: queryKeys.exams.misJuegos,
		queryFn: () => examsService.misJuegos(),
	});
}
