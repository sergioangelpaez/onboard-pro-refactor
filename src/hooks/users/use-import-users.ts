import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";

type Entrada = { archivo: File; tenantId?: string | null };

/**
 * Carga masiva de personas: primero se previsualiza el archivo y, si cierra,
 * se importa. Son dos pasos para que nadie cree cien cuentas con un error de
 * columnas sin haberlo visto antes.
 */
export function useImportUsers() {
	const queryClient = useQueryClient();

	const previsualizar = useMutation({
		mutationFn: ({ archivo, tenantId }: Entrada) =>
			usersService.previsualizarImportacion(archivo, tenantId),
	});

	const importar = useMutation({
		mutationFn: ({ archivo, tenantId }: Entrada) =>
			usersService.importar(archivo, tenantId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
			// Las filas con grupo suman integrantes: los grupos cambian también.
			queryClient.invalidateQueries({ queryKey: ["groups"] });
		},
	});

	return { previsualizar, importar };
}
