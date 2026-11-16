import { useQuery } from "@tanstack/react-query";
import { gamificationService } from "#/lib/services/gamification";
import { queryKeys } from "#/lib/utils/query-keys";

/** Mis últimas acreditaciones de XP (HU-056). */
export function useMisMovimientos(limite = 20) {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: [...queryKeys.gamification.movimientos, limite],
		queryFn: () => gamificationService.movimientos(limite),
		select: (r) => r.movimientos,
	});

	return { data, isLoading, error, refetch };
}
