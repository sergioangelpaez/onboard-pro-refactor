import { RefreshCw } from "lucide-react";
import type { User } from "#/lib/schemas/users";
import { EmptyState } from "../shared/states/empty-state";
import { ErrorState } from "../shared/states/error-state";
import { LoadingState } from "../shared/states/loading-state";
import { DataTable } from "../shared/table/data-table";
import { Button } from "../ui/button";
import { CreateUserDialogForm } from "./create-user-dialog-form";
import { usersColumns } from "./users-columns";

interface UsersRouteContentProps {
	data: User[] | undefined;
	isLoading: boolean;
	error: Error | null;
	refetch: () => void;
}

export function UsersRouteContent({
	data,
	isLoading,
	error,
	refetch,
}: UsersRouteContentProps) {
	if (isLoading) return <LoadingState message="Cargando usuarios..." />;

	if (!data && error)
		return (
			<ErrorState
				title="Error al cargar los usuarios"
				description="Ocurrió un error al intentar cargar los usuarios. Por favor, espera unos minutos e inténtalo de nuevo."
				content={
					<Button onClick={() => refetch()}>
						<RefreshCw />
						Recargar
					</Button>
				}
			/>
		);

	if (data && data.length === 0)
		return (
			<EmptyState
				title="Aún no hay usuarios"
				description="Aún no hay usuarios para mostrar aquí. Para empezar, crea un nuevo usuario."
				content={<CreateUserDialogForm />}
			/>
		);

	return (
		<div>
			<DataTable
				tableKey="users-table"
				columns={usersColumns}
				data={data ?? []}
			/>
			<div className="spacer-md" />
		</div>
	);
}
