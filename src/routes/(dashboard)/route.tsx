import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar } from "#/components/shared/app-sidebar/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export const Route = createFileRoute("/(dashboard)")({
	component: DashboardLayoutComponent,
});

function DashboardLayoutComponent() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main className="ml-0 flex min-h-screen w-full flex-col transition-all">
				<SidebarTrigger className="ml-4 mt-4" />
				<Outlet />
			</main>
		</SidebarProvider>
	);
}
