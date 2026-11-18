import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { dashboardService } from "#/lib/services/dashboard";
import { queryKeys } from "#/lib/utils/query-keys";

/** El panel de inicio de la administración para un periodo y una organización. */
export function useDashboard(tenantId: string | null, dias: number) {
	const { data, isLoading, isFetching, error, refetch } = useQuery({
		queryKey: queryKeys.dashboard.resumen(tenantId, dias),
		queryFn: () => dashboardService.resumen({ tenantId, dias }),
		// Al cambiar de periodo se deja ver el anterior mientras llega el nuevo:
		// que el panel entero parpadee a "Cargando" cada vez distrae. Al cambiar
		// de organización no: mostrar los números de otra empresa confunde.
		placeholderData: (anterior, consultaAnterior) =>
			consultaAnterior?.queryKey[1] === (tenantId ?? "plataforma")
				? keepPreviousData(anterior)
				: undefined,
	});

	return { data, isLoading, isFetching, error, refetch };
}
