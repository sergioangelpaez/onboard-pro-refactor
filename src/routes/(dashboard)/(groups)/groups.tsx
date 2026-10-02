import { createFileRoute } from "@tanstack/react-router";
import { CreateGroupDialogForm } from "#/components/groups/create-group-dialog-form";
import { GroupsRouteContent } from "#/components/groups/groups-route-content";
import { useAllGroups } from "#/hooks/groups/use-all-groups";

export const Route = createFileRoute("/(dashboard)/(groups)/groups")({
	component: GroupsRoute,
});

function GroupsRoute() {
	const { data, isLoading, error, refetch } = useAllGroups();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Grupos</h1>
				<CreateGroupDialogForm />
			</div>
			<GroupsRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => {}}
			/>
		</div>
	);
}
