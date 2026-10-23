import { useQuery } from "@tanstack/react-query";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { usersService } from "#/lib/services/users";
import { queryKeys } from "#/lib/utils/query-keys";
import { deLaOrganizacion } from "#/lib/utils/tenant-activo";

export function useAllUsers() {
	// El superadmin ve solo la organización que eligió en el menú.
	const organizacion = useOrganizacionActiva();
	const { data, error, isError, isLoading, refetch } = useQuery({
		queryKey: queryKeys.users.all,
		queryFn: () => usersService.getAll(),
	});

	return {
		data: deLaOrganizacion(data, organizacion),
		error,
		isError,
		isLoading,
		refetch,
	};
}
