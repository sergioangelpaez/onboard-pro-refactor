import {
	BuildingComplex,
	GalleryVerticalEnd,
	LibraryBig,
	ListTodo,
	UserGroup,
	Users,
} from "lucide-react";
import type * as React from "react";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { normalizeRole } from "#/lib/utils/auth/session";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@/components/ui/sidebar";
import type { User } from "@/lib/schemas/users";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";

type Role = User["role"];

const organizaciones = [
	{
		name: "Universidad Central",
		logo: GalleryVerticalEnd,
		plan: "",
	},
];

const navByRole: Record<Role, React.ComponentProps<typeof NavMain>["items"]> = {
	admin: [
		{
			title: "Organizaciones",
			url: "/admin/tenants",
			icon: BuildingComplex,
			isActive: true,
		},
		{
			title: "Usuarios",
			url: "/admin/users",
			icon: Users,
			isActive: false,
		},
		{
			title: "Cursos",
			url: "/admin/courses",
			icon: LibraryBig,
			isActive: false,
		},
		{
			title: "Grupos",
			url: "/admin/groups",
			icon: UserGroup,
			isActive: false,
		},
		{
			title: "Actividades",
			url: "/admin/activities",
			icon: ListTodo,
			isActive: false,
		},
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
