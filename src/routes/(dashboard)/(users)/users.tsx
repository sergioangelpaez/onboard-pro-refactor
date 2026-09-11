import { createFileRoute } from "@tanstack/react-router";
import { CreateUserDialog } from "#/components/users/create-user-dialog";

export const Route = createFileRoute("/(dashboard)/(users)/users")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">Usuarios</h1>
				<CreateUserDialog />
			</div>
		</div>
	);
}
