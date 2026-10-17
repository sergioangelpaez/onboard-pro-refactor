import { GalleryVerticalEnd } from "lucide-react";
import type * as React from "react";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { menuDe } from "#/lib/utils/roles";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useCurrentUser();

	if (!user) return null;

	// Cada rol tiene su propio menú, con sus grupos y sus nombres: un
	// instructor ve "Docencia · Mis cursos", un administrador "Mi empresa ·
	// Personas". Sale de lib/utils/roles.
	const grupos = menuDe(user.role);

	// El nombre de la organización sale del usuario y no de una constante:
	// antes decía "Universidad Central" para todo el mundo.
	const organizaciones = [
		{
			name: user.tenantName ?? "OnBoard Pro",
			logo: GalleryVerticalEnd,
			plan: "",
		},
	];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={organizaciones} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain groups={grupos} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
