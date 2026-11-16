import { createFileRoute } from "@tanstack/react-router";
import { FileUp, Plus } from "lucide-react";
import { useState } from "react";
import { ImportUsersDialog } from "#/components/admin/users/import-users-dialog";
import { UserFormSheet } from "#/components/admin/users/user-form";
import { UsersRouteContent } from "#/components/admin/users/users-route-content";
import { useAllUsers } from "#/hooks/users/use-all-users";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { puedeAdministrarPersonas } from "#/lib/utils/roles";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/(users)/users")({
	component: UsersRoute,
});

function UsersRoute() {
	const [open, setOpen] = useState(false);
	const [importando, setImportando] = useState(false);
	const { data, isLoading, error, refetch } = useAllUsers();
	const { user } = useCurrentUser();
	// El instructor ve a la gente de su organizacion, pero no la crea:
	// userRoutes solo deja POST /create a admin y superadmin.
	const puedeAdministrar = puedeAdministrarPersonas(user?.role);

	return (
		<div className="app-container">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h1>Usuarios</h1>
				{puedeAdministrar && (
					<div className="flex flex-wrap gap-2">
						{/* Para dar de alta a una camada entera de ingresantes sin
						    cargarlos de a uno. */}
						<Button variant="outline" onClick={() => setImportando(true)}>
							<FileUp />
							Importar usuarios
						</Button>
						<Button onClick={() => setOpen(true)}>
							<Plus />
							Crear usuario
						</Button>
					</div>
				)}
			</div>

			<UsersRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => setOpen(true)}
			/>

			<UserFormSheet open={open} onOpenChange={setOpen} />
			{puedeAdministrar && (
				<ImportUsersDialog open={importando} onOpenChange={setImportando} />
			)}
		</div>
	);
}
