import { createFileRoute } from "@tanstack/react-router";
import { CreateGroupDialogForm } from "#/components/groups/create-group-dialog-form";

export const Route = createFileRoute("/(dashboard)/(groups)/groups")({
	component: GroupsRoute,
});

function GroupsRoute() {
	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Grupos</h1>
				<CreateGroupDialogForm />
			</div>
		</div>
	);
}
