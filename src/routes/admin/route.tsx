import {
	createFileRoute,
	Outlet,
	redirect,
	useRouterState,
} from "@tanstack/react-router";
import { Eye } from "lucide-react";
import { AppSidebar } from "#/components/shared/app-sidebar/app-sidebar";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";
import { areaDe, getCurrentUser, getHomeByRole } from "#/lib/utils/auth/session";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context }) => {
		const user = await getCurrentUser(context.queryClient);
		if (!user) throw redirect({ to: "/auth" });
		if (user.debeCambiarPassword) throw redirect({ to: "/cambiar-password" });
		if (areaDe(user.role) !== "/admin")
			throw redirect({ to: getHomeByRole(user.role) });
		return { user };
	},
	component: DashboardLayoutComponent,
});

function DashboardLayoutComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="ml-0 flex min-h-screen min-w-0 flex-1 flex-col transition-all">
				{/* En el celular la barra se esconde entera: ahí el botón va afuera. */}
				<SidebarTrigger className="mt-4 ml-4 md:hidden" />
				<AvisoModoConsulta />
				<Outlet />
			</main>
		</SidebarProvider>
	);
}

/**
 * El superadmin dentro de una organización solo consulta: lo avisa arriba de
 * cada pantalla para que no busque botones que no tiene. En Organizaciones
 * (lo suyo) no aparece.
 */
function AvisoModoConsulta() {
	const soloLectura = useSoloLectura();
	const organizacion = useOrganizacionActiva();
	const ruta = useRouterState({ select: (s) => s.location.pathname });
	if (!soloLectura || !organizacion || ruta.startsWith("/admin/tenants"))
		return null;
	return (
		<div className="mx-auto w-full max-w-7xl px-6 pt-6">
			<output className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 text-muted-foreground text-sm">
				<Eye className="size-4 shrink-0" />
				Modo consulta: los cambios los hace el administrador de la
				organización. Desde aquí solo puedes crear administradores.
			</output>
		</div>
	);
}
