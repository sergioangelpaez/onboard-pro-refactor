import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "#/components/shared/app-sidebar/app-sidebar";
import { authService } from "#/lib/services/auth";
import { InvalidCredentialsError } from "#/lib/services/errors";
import { queryKeys } from "#/lib/utils/query-keys";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(dashboard)")({
	component: DashboardLayoutComponent,
	ssr: false,
	beforeLoad: async ({ context }) => {
		try {
			const user = await context.queryClient.ensureQueryData({
				queryKey: queryKeys.users.me,
				queryFn: authService.getMe,
			});
			return { user };
		} catch (error) {
			if (error instanceof InvalidCredentialsError) {
				throw redirect({ to: "/auth" });
			}
			throw error;
		}
	},
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
