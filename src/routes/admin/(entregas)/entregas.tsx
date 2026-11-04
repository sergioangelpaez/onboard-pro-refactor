import { createFileRoute } from "@tanstack/react-router";
import { BandejaEntregas } from "#/components/admin/entregas/bandeja-entregas";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { rolReal } from "#/lib/utils/auth/session";

export const Route = createFileRoute("/admin/(entregas)/entregas")({
	component: EntregasRoute,
});

/** El superadmin revisa las de la organización que eligió en el menú. */
function EntregasRoute() {
	const { user } = useCurrentUser();
	const organizacion = useOrganizacionActiva();
	const esSuper = rolReal(user?.role) === "superadmin";
	return <BandejaEntregas tenantId={esSuper ? organizacion : null} />;
}
