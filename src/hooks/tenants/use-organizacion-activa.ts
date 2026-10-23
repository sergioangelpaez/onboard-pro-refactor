import { useCurrentUser } from "#/hooks/users/use-current-user";
import { rolReal } from "#/lib/utils/auth/session";
import { useTenantActivo } from "#/lib/utils/tenant-activo";

/**
 * La organización por la que hay que filtrar lo que se muestra, o null si no
 * hay que filtrar.
 *
 * Solo aplica al superadmin, que recibe del backend los datos de todas las
 * empresas. A los demás el backend ya les devuelve solo lo suyo, y aunque en
 * el navegador quedara guardada una organización de otra sesión, se ignora.
 */
export function useOrganizacionActiva() {
	const { user } = useCurrentUser();
	const activo = useTenantActivo();
	return rolReal(user?.role) === "superadmin" ? activo : null;
}
