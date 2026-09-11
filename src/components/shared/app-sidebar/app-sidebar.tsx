"use client";

import { BuildingComplex, GalleryVerticalEnd, Users } from "lucide-react";
import type * as React from "react";
import { useCurrentUser } from "#/hooks/users/use-current-user";
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

const data = {
	organizaciones: [
		{
			name: "Universidad Central",
			logo: GalleryVerticalEnd,
			plan: "",
		},
	],
	navMain: [
		{
			title: "Organizaciones",
			url: "/tenants",
			icon: BuildingComplex,
			isActive: true,
			isCollapsible: false,
		},
		{
			title: "Usuarios",
			url: "/users",
			icon: Users,
			isActive: false,
			isCollapsible: false,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useCurrentUser();

	if (!user) return null;

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={data.organizaciones} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
