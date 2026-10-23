import { useQuery } from "@tanstack/react-query";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";
import { deLaOrganizacion } from "#/lib/utils/tenant-activo";

/** `archivados: "solo"` trae únicamente los archivados; sin nada, el catálogo normal. */
export function useAllCourses(archivados?: "solo") {
	// El superadmin ve solo la organización que eligió en el menú.
	const organizacion = useOrganizacionActiva();
	const { data, isLoading, error, refetch } = useQuery({
		queryKey: archivados
			? [...queryKeys.courses.all, archivados]
			: queryKeys.courses.all,
		queryFn: () => coursesService.getAll(archivados),
	});

	return {
		data: deLaOrganizacion(data, organizacion),
		isLoading,
		error,
		refetch,
	};
}
