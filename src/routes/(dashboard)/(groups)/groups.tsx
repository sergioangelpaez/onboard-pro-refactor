import { createFileRoute } from "@tanstack/react-router";
import { CreateGroupForm } from "#/components/groups/create-group-form";

export const Route = createFileRoute("/(dashboard)/(groups)/groups")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Grupos</h1>
				<CreateGroupForm />
			</div>
		</div>
	);
}
