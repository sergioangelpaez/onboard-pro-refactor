import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { UserFormSheet } from "#/components/users/user-form";
import { useAllUsers } from "#/hooks/users/use-all-users";
import { Button } from "@/components/ui/button";
import { UsersRouteContent } from "@/components/users/users-route-content";

export const Route = createFileRoute("/(dashboard)/(users)/users")({
	component: UsersRoute,
});

function UsersRoute() {
	const [open, setOpen] = useState(false);
	const { data, isLoading, error, refetch } = useAllUsers();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Usuarios</h1>
				<Button onClick={() => setOpen(true)}>
					<Plus />
					Crear usuario
				</Button>
			</div>

			<UsersRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => setOpen(true)}
			/>

			<UserFormSheet open={open} onOpenChange={setOpen} />
		</div>
	);
}
