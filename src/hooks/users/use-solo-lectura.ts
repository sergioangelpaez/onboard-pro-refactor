import { rolReal } from "#/lib/utils/auth/session";
import { useCurrentUser } from "./use-current-user";

/**
 * true si quien mira solo puede consultar lo de una organización.
 *
 * El superadministrador administra la plataforma (las organizaciones), no lo
 * que pasa dentro de cada una: puede ver todo, pero crear, editar, publicar,
 * calificar o borrar lo hace el administrador de la organización. La única
 * excepción es dar de alta a ese administrador. El backend aplica la misma
 * regla y responde 403; esto solo evita mostrar botones que no funcionan.
 *
 * Todas las pantallas de administración preguntan acá, para que la regla
 * viva en un solo lugar.
 */
export function useSoloLectura() {
	const { user } = useCurrentUser();
	return rolReal(user?.role) === "superadmin";
}
