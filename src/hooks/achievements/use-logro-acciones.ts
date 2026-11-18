import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type EditarLogroPayload, logrosService } from "#/lib/services/logros";
import { queryKeys } from "#/lib/utils/query-keys";

/** Editar, activar o desactivar y eliminar un logro; y cerrar el ranking. */
export function useLogroAcciones() {
	const queryClient = useQueryClient();
	const refrescar = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.achievements.all });

	const editar = useMutation({
		mutationFn: ({ id, cambios }: { id: string; cambios: EditarLogroPayload }) =>
			logrosService.update(id, cambios),
		onSuccess: refrescar,
	});
	const eliminar = useMutation({
		mutationFn: (id: string) => logrosService.remove(id),
		onSuccess: refrescar,
	});
	const cerrarRanking = useMutation({
		mutationFn: (tenantId: string | null) => logrosService.cerrarRanking(tenantId),
		onSuccess: refrescar,
	});

	return { editar, eliminar, cerrarRanking };
}
