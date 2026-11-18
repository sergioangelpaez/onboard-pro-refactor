import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { GroupFormSheet } from "#/components/admin/groups/groups-form";
import { GroupsRouteContent } from "#/components/admin/groups/groups-route-content";
import { Button } from "#/components/ui/button";
import { useAllGroups } from "#/hooks/groups/use-all-groups";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { puedeGestionarGrupos } from "#/lib/utils/roles";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";

export const Route = createFileRoute("/admin/(groups)/groups")({
	component: GroupsRoute,
});

function GroupsRoute() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const { data, isLoading, error, refetch } = useAllGroups();
	const { user } = useCurrentUser();
	// Crear un grupo y mover integrantes tambien lo puede el instructor.
	// El superadmin solo consulta.
	const soloLectura = useSoloLectura();
	const puedeGestionar = puedeGestionarGrupos(user?.role) && !soloLectura;

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Grupos</h1>
				{puedeGestionar && (
					<Button onClick={() => setIsCreateOpen(true)}>
						<Plus />
						Crear grupo
					</Button>
				)}
			</div>
			<GroupsRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => setIsCreateOpen(true)}
			/>

			<GroupFormSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
		</div>
	);
}
