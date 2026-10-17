"use client";

import { Link } from "@tanstack/react-router";
import {
	BuildingComplex,
	LayoutDashboard,
	LibraryBig,
	UserGroup,
	Users,
} from "lucide-react";
import type { IconName, MenuGroup } from "#/lib/utils/roles";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

const ICONOS: Record<IconName, React.ComponentType> = {
	dashboard: LayoutDashboard,
	tenants: BuildingComplex,
	users: Users,
	courses: LibraryBig,
	groups: UserGroup,
};

/**
 * El menú lateral, agrupado por rol: "Docencia", "Personas", "Contenido".
 * Los grupos ya vienen filtrados, así que acá solo se pintan.
 *
 * No hay desplegables: cada elemento lleva directo a su pantalla.
 */
export function NavMain({ groups }: { groups: MenuGroup[] }) {
	return (
		<>
			{groups.map((grupo) => (
				<SidebarGroup key={grupo.label}>
					<SidebarGroupLabel>{grupo.label}</SidebarGroupLabel>
					<SidebarMenu>
						{grupo.items.map((item) => {
							const Icono = ICONOS[item.icon];
							return (
								<SidebarMenuItem key={item.url}>
									<SidebarMenuButton asChild tooltip={item.label}>
										<Link to={item.url}>
											<Icono />
											<span>{item.label}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							);
						})}
					</SidebarMenu>
				</SidebarGroup>
			))}
		</>
	);
}
