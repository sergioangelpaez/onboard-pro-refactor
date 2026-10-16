import { createFileRoute } from "@tanstack/react-router";
import { ChangePasswordDialogForm } from "#/components/auth/change-password-dialog-form";
import { UserDetailsCard } from "#/components/profile/user-details-card";
import { UserGroupsCard } from "#/components/profile/user-groups-card";
import { UserProgressCard } from "#/components/profile/user-progress-card";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { useMyGroups } from "#/hooks/groups/use-my-groups";
import { useCurrentUser } from "#/hooks/users/use-current-user";

export const Route = createFileRoute("/(dashboard)/profile")({
	component: ProfileRoute,
});

function ProfileRoute() {
	const {
		user,
		isLoading: isUserLoading,
		error: isUserError,
	} = useCurrentUser();
	const {
		groups,
		isLoading: isGroupsLoading,
		isError: isGroupsError,
		refetch: refetchGroups,
	} = useMyGroups();

	if (isUserLoading) {
		return <LoadingState message="Cargando tu información..." />;
	}

	if (isUserError) {
		return (
			<ErrorState
				title="Error al obtener tus datos"
				description="Ocurrió un error al tratar de obtener tu información desde el servidor. Espera unos minutos e intenta recargar la página."
			/>
		);
	}

	return (
		<div className="app-container">
			<div className="flex flex-col w-full">
				<div className="mb-4 flex items-center w-full justify-between">
					<h1>Perfil</h1>
					<ChangePasswordDialogForm />
				</div>
				<div className="grid grid-cols-2 gap-3">
					<UserDetailsCard user={user} />
					<UserProgressCard user={user} />
					<UserGroupsCard
						groups={groups ?? []}
						className="col-span-2"
						isLoading={isGroupsLoading}
						isError={isGroupsError}
						refetch={refetchGroups}
					/>
				</div>
			</div>
		</div>
	);
}
