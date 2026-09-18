import { createFileRoute } from "@tanstack/react-router";
import { CreateUserFormDialog } from "#/components/courses/create-user-form";

export const Route = createFileRoute("/(dashboard)/(courses)/courses")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Organizaciones</h1>
				<CreateUserFormDialog />
			</div>
		</div>
	);
}
