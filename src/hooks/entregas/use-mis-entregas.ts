import { useQuery } from "@tanstack/react-query";
import { entregasService } from "#/lib/services/entregas";
import { queryKeys } from "#/lib/utils/query-keys";

/** Todas mis entregas, con su estado y lo que me dijeron al revisarlas. */
export function useMisEntregas() {
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: queryKeys.entregas.mias,
		queryFn: () => entregasService.mias(),
	});

	return { data, isLoading, error, refetch };
}
