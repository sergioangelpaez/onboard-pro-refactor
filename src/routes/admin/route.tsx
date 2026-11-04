import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "#/components/shared/app-sidebar/app-sidebar";
import { areaDe, getCurrentUser, getHomeByRole } from "#/lib/utils/auth/session";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context }) => {
		const user = await getCurrentUser(context.queryClient);
		if (!user) throw redirect({ to: "/auth" });
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
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
