import { createFileRoute } from "@tanstack/react-router";
import { CreateUserDialogForm } from "#/components/users/create-user-dialog-form";
import { UsersRouteContent } from "#/components/users/users-route-content";
import { useAllUsers } from "#/hooks/users/use-users";

export const Route = createFileRoute("/(dashboard)/(users)/users")({
	component: UsersRoute,
});

function UsersRoute() {
	const { data, isLoading, error, refetch } = useAllUsers();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Usuarios</h1>
				<CreateUserDialogForm />
			</div>

			<UsersRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
			/>
		</div>
	);
}
