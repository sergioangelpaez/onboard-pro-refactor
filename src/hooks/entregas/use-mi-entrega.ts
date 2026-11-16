import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entregasService } from "#/lib/services/entregas";
import { queryKeys } from "#/lib/utils/query-keys";

/** Mi entrega de una tarea y la acción de subirla o reemplazarla. */
export function useMiEntrega(activityId: string) {
	const queryClient = useQueryClient();

	const consulta = useQuery({
		queryKey: queryKeys.entregas.mine(activityId),
		queryFn: () => entregasService.mine(activityId),
	});

	const entregar = useMutation({
		mutationFn: ({
			archivo,
			comentario,
		}: {
			archivo: File | null;
			comentario: string;
		}) => entregasService.submit(activityId, archivo, comentario),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.entregas.mine(activityId),
			});
			// El estado de la entrega también se muestra en la lista del curso.
			queryClient.invalidateQueries({ queryKey: ["sections"] });
			// Y en "Mis entregas" del perfil.
			queryClient.invalidateQueries({ queryKey: queryKeys.entregas.mias });
		},
	});

	return { ...consulta, entregar };
}
