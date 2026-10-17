import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "@/lib/services/groups";
import { queryKeys } from "@/lib/utils/query-keys";

/**
 * Agregar y quitar integrantes de un grupo.
 *
 * Las dos invalidan el listado, que es de donde sale el detalle: asi la tabla
 * y la pantalla del grupo nunca muestran cosas distintas.
 */
export function useGroupMembers(groupId: string) {
	const queryClient = useQueryClient();

	const refrescar = () => {
		queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
	};

	const agregar = useMutation({
		mutationFn: ({ userIds }: { userIds: string[] }) =>
			groupsService.addUsers(groupId, userIds),
		onSuccess: refrescar,
	});

	const quitar = useMutation({
		mutationFn: ({ userIds }: { userIds: string[] }) =>
			groupsService.removeUsers(groupId, userIds),
		onSuccess: refrescar,
	});

	return { agregar, quitar };
}
