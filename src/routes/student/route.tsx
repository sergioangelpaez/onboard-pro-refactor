import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "#/components/shared/app-sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "#/components/ui/sidebar";
import { areaDe, getCurrentUser, getHomeByRole } from "#/lib/utils/auth/session";

export const Route = createFileRoute("/student")({
	beforeLoad: async ({ context }) => {
		const user = await getCurrentUser(context.queryClient);
		if (!user) throw redirect({ to: "/auth" });
		if (areaDe(user.role) !== "/student")
			throw redirect({ to: getHomeByRole(user.role) });
		return { user };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="ml-0 flex min-h-screen min-w-0 flex-1 flex-col transition-all">
				<SidebarTrigger className="ml-4 mt-4" />
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
