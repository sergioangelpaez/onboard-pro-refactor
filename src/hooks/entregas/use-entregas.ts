import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entregasService } from "#/lib/services/entregas";
import { queryKeys } from "#/lib/utils/query-keys";

/** Las entregas de una actividad y la accion de revisarlas (HU-048). */
export function useEntregas(activityId: string, habilitado = true) {
	const queryClient = useQueryClient();

	const consulta = useQuery({
		queryKey: queryKeys.entregas.byActivity(activityId),
		queryFn: () => entregasService.byActivity(activityId),
		enabled: habilitado,
	});

	const revisar = useMutation({
		mutationFn: ({
			entregaId,
			aprobada,
			feedback,
		}: { entregaId: string; aprobada: boolean; feedback: string }) =>
			entregasService.revisar(entregaId, aprobada, feedback),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.entregas.byActivity(activityId),
			});
		},
	});

	return { ...consulta, revisar };
}
