import {
	BuildingComplex,
	GalleryVerticalEnd,
	LayoutDashboard,
	LibraryBig,
	ListTodo,
	UserGroup,
	Users,
} from "lucide-react";
import type * as React from "react";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { normalizeRole, type Role } from "#/lib/utils/auth/session";
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

const organizaciones = [
	{
		name: "Universidad Central",
		logo: GalleryVerticalEnd,
		plan: "",
	},
];

const RESUMEN = {
	title: "Resumen",
	url: "/admin/home",
	icon: LayoutDashboard,
	isActive: true,
};
const USUARIOS = {
	title: "Usuarios",
	url: "/admin/users",
	icon: Users,
	isActive: false,
};
const CURSOS = {
	title: "Cursos",
	url: "/admin/courses",
	icon: LibraryBig,
	isActive: false,
};
const GRUPOS = {
	title: "Grupos",
	url: "/admin/groups",
	icon: UserGroup,
	isActive: false,
};
const ACTIVIDADES = {
	title: "Actividades",
	url: "/admin/activities",
	icon: ListTodo,
	isActive: false,
};

/**
 * Que ve cada rol, siguiendo lo que exige el backend con `requireRole`.
 *
 * Organizaciones es solo del superadministrador: `tenantRoutes` pide ese rol.
 * El instructor entra al area de administracion porque administra el
 * contenido de sus cursos, aunque no de de alta personas ni toque empresas;
 * el servidor ya le devuelve solo los cursos que dicta.
 */
const navByRole: Record<Role, React.ComponentProps<typeof NavMain>["items"]> = {
	superadmin: [
		RESUMEN,
		{
			title: "Organizaciones",
			url: "/admin/tenants",
			icon: BuildingComplex,
			isActive: false,
		},
		USUARIOS,
		CURSOS,
		GRUPOS,
		ACTIVIDADES,
	],
	admin: [RESUMEN, USUARIOS, CURSOS, GRUPOS, ACTIVIDADES],
	// Su propia area: no comparte pantallas con la administracion de la empresa.
	instructor: [
		{ ...RESUMEN, url: "/instructor/home" },
		{ ...CURSOS, title: "Mis cursos", url: "/instructor/courses" },
		{ ...GRUPOS, url: "/instructor/groups" },
	],
	student: [
		{
			title: "Mis actividades",
			url: "/student/activities",
			icon: ListTodo,
			isActive: false,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useCurrentUser();

	if (!user) return null;

	const items = navByRole[normalizeRole(user.role)];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<TeamSwitcher teams={organizaciones} />
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={items} />
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
