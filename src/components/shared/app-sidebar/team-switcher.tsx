import { Link } from "@tanstack/react-router";
import {
	Building2,
	Check,
	ChevronsUpDown,
	Globe,
	Settings2,
} from "lucide-react";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { rolReal } from "#/lib/utils/auth/session";
import { setTenantActivo, useTenantActivo } from "#/lib/utils/tenant-activo";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";

/**
 * La organización en la parte de arriba del menú.
 *
 * Para el superadmin es un selector: puede ver todas las organizaciones juntas
 * o pararse en una. Para el resto es solo el nombre de su empresa, que no
 * cambia: el backend ya les filtra todo por la organización de su sesión.
 *
 * Antes mostraba "Universidad Central" fijo y un "Add team" de la plantilla.
 */
export function TeamSwitcher() {
	const { user } = useCurrentUser();
	const esSuper = rolReal(user?.role) === "superadmin";

	if (!esSuper) {
		return (
			<SidebarMenu>
				<SidebarMenuItem>
					<SidebarMenuButton
						size="lg"
						className="cursor-default hover:bg-transparent"
					>
						<Logo icono={<Building2 className="size-4" />} />
						<Nombre titulo={user?.tenantName ?? "Mi organización"} />
					</SidebarMenuButton>
				</SidebarMenuItem>
			</SidebarMenu>
		);
	}

	return <SelectorSuperadmin />;
}

function SelectorSuperadmin() {
	const { isMobile } = useSidebar();
	const { data: empresas = [] } = useAllTenants();
	const activo = useTenantActivo();
	const actual = empresas.find((e) => e.id === activo);

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size="lg"
							className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						>
							<Logo
								icono={
									actual ? (
										<Building2 className="size-4" />
									) : (
										<Globe className="size-4" />
									)
								}
							/>
							<Nombre
								titulo={actual?.name ?? "Todas las organizaciones"}
								subtitulo={
									actual ? actual.domain : `${empresas.length} organizaciones`
								}
							/>
							<ChevronsUpDown className="ml-auto" />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
						align="start"
						side={isMobile ? "bottom" : "right"}
						sideOffset={4}
					>
						<DropdownMenuItem
							onClick={() => setTenantActivo(null)}
							className="gap-2 p-2"
						>
							<Mini icono={<Globe className="size-3.5" />} />
							Todas las organizaciones
							{!activo && <Check className="ml-auto size-4" />}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuLabel className="text-muted-foreground text-xs">
							Organizaciones
						</DropdownMenuLabel>
						{empresas.map((e) => (
							<DropdownMenuItem
								key={e.id}
								onClick={() => setTenantActivo(e.id)}
								className="gap-2 p-2"
							>
								<Mini icono={<Building2 className="size-3.5" />} />
								<span className="truncate">{e.name}</span>
								{e.id === activo && <Check className="ml-auto size-4" />}
							</DropdownMenuItem>
						))}
						<DropdownMenuSeparator />
						<DropdownMenuItem asChild className="gap-2 p-2">
							<Link to="/admin/tenants">
								<Mini icono={<Settings2 className="size-3.5" />} />
								<span className="text-muted-foreground">
									Administrar organizaciones
								</span>
							</Link>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}

function Logo({ icono }: { icono: React.ReactNode }) {
	return (
		<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
			{icono}
		</div>
	);
}

function Nombre({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
	return (
		<div className="grid flex-1 text-left text-sm leading-tight">
			<span className="truncate font-medium">{titulo}</span>
			{subtitulo && <span className="truncate text-xs">{subtitulo}</span>}
		</div>
	);
}

function Mini({ icono }: { icono: React.ReactNode }) {
	return (
		<div className="flex size-6 shrink-0 items-center justify-center rounded-md border">
			{icono}
		</div>
	);
}
