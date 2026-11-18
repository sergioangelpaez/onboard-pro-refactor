import { useQuery } from "@tanstack/react-query";
import {
	gamificationService,
	type PeriodoRanking,
} from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

/** El ranking de la organización o, con `grupoId`, el de uno de sus grupos. */
export function useRanking(
	grupoId?: string,
	habilitado = true,
	periodo: PeriodoRanking = "siempre",
) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [
			...queryKeys.gamification.ranking,
			grupoId ?? "organizacion",
			periodo,
		],
		queryFn: () => gamificationService.ranking(grupoId, periodo),
		enabled: habilitado,
	});

	return { data, isLoading, error, refetch };
}
