import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	type EstadoBandeja,
	entregasService,
} from "#/lib/services/entregas";
import { queryKeys } from "#/lib/utils/query-keys";

/** Mi bandeja de entregas, con sus filtros, y la acción de revisar una. */
export function useBandeja(params: {
	estado: EstadoBandeja;
	orden: "antiguas" | "recientes";
	cursoId?: string;
	tenantId?: string | null;
}) {
	const queryClient = useQueryClient();
	const consulta = useQuery({
		queryKey: [...queryKeys.entregas.bandeja, params],
		queryFn: () => entregasService.bandeja(params),
	});

	const revisar = useMutation({
		mutationFn: ({ entregaId, feedback }: { entregaId: string; feedback: string }) =>
			entregasService.revisar(entregaId, true, feedback),
		onSuccess: () => {
			// La bandeja y la lista de entregas de cada actividad.
			queryClient.invalidateQueries({ queryKey: ["entregas"] });
		},
	});

	return { ...consulta, revisar };
}
