import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { GroupFormSheet } from "#/components/groups/groups-form";
import { GroupsRouteContent } from "#/components/groups/groups-route-content";
import { Button } from "#/components/ui/button";
import { useAllGroups } from "#/hooks/groups/use-all-groups";

export const Route = createFileRoute("/(dashboard)/(groups)/groups")({
	component: GroupsRoute,
});

function GroupsRoute() {
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const { data, isLoading, error, refetch } = useAllGroups();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Grupos</h1>
				<Button onClick={() => setIsCreateOpen(true)}>
					<Plus />
					Crear grupo
				</Button>
			</div>
			<GroupsRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => {}}
			/>

			<GroupFormSheet open={isCreateOpen} onOpenChange={setIsCreateOpen} />
		</div>
	);
}
