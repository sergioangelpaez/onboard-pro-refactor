import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "#/components/shared/app-sidebar/app-sidebar";
import { getCurrentUser, normalizeRole } from "#/lib/utils/auth/session";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/admin")({
	beforeLoad: async ({ context }) => {
		const user = await getCurrentUser(context.queryClient);
		if (!user) throw redirect({ to: "/auth" });
		if (normalizeRole(user.role) !== "admin")
			throw redirect({ to: "/student/home" });
		return { user };
	},
	component: DashboardLayoutComponent,
});

function DashboardLayoutComponent() {
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
