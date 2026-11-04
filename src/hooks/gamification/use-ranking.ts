import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

/** El ranking de la organización o, con `grupoId`, el de uno de sus grupos. */
export function useRanking(grupoId?: string, habilitado = true) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [...queryKeys.gamification.ranking, grupoId ?? "organizacion"],
		queryFn: () => gamificationService.ranking(grupoId),
		enabled: habilitado,
	});

	return { data, isLoading, error, refetch };
}
