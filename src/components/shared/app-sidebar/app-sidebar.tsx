import {
	BuildingComplex,
	CircleUser,
	Inbox,
	LayoutDashboard,
	LibraryBig,
	ListTodo,
	Medal,
	Trophy,
	UserGroup,
	Users,
} from "lucide-react";
import type * as React from "react";
import { SidebarProgress } from "#/components/student/sidebar-progress";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { type RolReal, rolReal } from "#/lib/utils/auth/session";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

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
const ENTREGAS = {
	title: "Entregas",
	url: "/instructor/entregas",
	icon: Inbox,
	isActive: false,
};
const LOGROS = {
	title: "Logros",
	url: "/admin/logros",
	icon: Medal,
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
const navByRole: Record<
	RolReal,
	React.ComponentProps<typeof NavMain>["items"]
> = {
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
		LOGROS,
	],
	admin: [RESUMEN, USUARIOS, CURSOS, GRUPOS, ACTIVIDADES, LOGROS],
	// Su propia area: no comparte pantallas con la administracion de la empresa.
	instructor: [
		{ ...RESUMEN, url: "/instructor/home" },
		{ ...CURSOS, title: "Mis cursos", url: "/instructor/courses" },
		{ ...ENTREGAS, url: "/instructor/entregas" },
		{ ...GRUPOS, url: "/instructor/groups" },
	],
	student: [
		{ ...RESUMEN, title: "Inicio", url: "/student/home" },
		// Las actividades se hacen dentro de cada curso, donde se ve su sección
		// y su estado. Lo pendiente de todos los cursos está en el inicio.
		{ ...CURSOS, title: "Mis cursos", url: "/student/courses" },
		{ ...LOGROS, title: "Mis logros", url: "/student/logros" },
		{
			title: "Ranking",
			url: "/student/ranking",
			icon: Trophy,
			isActive: false,
		},
		{
			title: "Mi perfil",
			url: "/student/profile",
			icon: CircleUser,
			isActive: false,
		},
	],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const { user } = useCurrentUser();
	const organizacion = useOrganizacionActiva();

	if (!user) return null;

	// Organizaciones es de la plataforma: el superadmin la ve solo cuando no
	// está parado en ninguna empresa.
	const items = navByRole[rolReal(user.role)].filter(
		(i) => !(organizacion && i.url === "/admin/tenants"),
	);

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				{/* Abrir y cerrar la barra desde la barra misma: así no ocupa lugar
				    arriba del contenido. En el celular se usa el de afuera. */}
				<div className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
					<div className="min-w-0 flex-1 group-data-[collapsible=icon]:w-full">
						<TeamSwitcher />
					</div>
					<SidebarTrigger className="hidden shrink-0 text-muted-foreground md:inline-flex" />
				</div>
			</SidebarHeader>
			<SidebarContent>
				<NavMain items={items} />
				{/* El aprendiz tiene su progreso siempre a la vista. */}
				{rolReal(user.role) === "student" && <SidebarProgress />}
			</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
