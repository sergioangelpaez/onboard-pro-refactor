import { createFileRoute } from "@tanstack/react-router";
import { CreateUserDialogForm } from "#/components/users/create-user-dialog-form";

export const Route = createFileRoute("/(dashboard)/(users)/users")({
	component: UsersRoute,
});

function UsersRoute() {
	return (
		<div className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<h1>Usuarios</h1>
				<CreateUserDialogForm />
			</div>
		</div>
	);
}
