import { RefreshCcw } from "lucide-react";
import type { Group } from "#/lib/schemas/groups";
import { EmptyState } from "../shared/states/empty-state";
import { ErrorState } from "../shared/states/error-state";
import { LoadingState } from "../shared/states/loading-state";
import { Avatar, AvatarFallback, AvatarGroup } from "../ui/avatar";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";

interface UserGroupsCardProps {
	groups: Group[];
	isLoading?: boolean;
	isError?: boolean;
	refetch?: () => void;
	className?: string;
}

export function UserGroupsCard({
	groups,
	isLoading,
	isError,
	refetch,
	className,
}: UserGroupsCardProps) {
	if (isLoading) {
		return (
			<Card className={className}>
				<CardContent>
					<LoadingState message="Cargando tus grupos..." />
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className={className}>
				<CardContent>
					<ErrorState
						title="Error al obtener tus grupos"
						description="Ocurrió un error al tratar de obtener tus grupos desde el servidor. Espera unos minutos e inténtalo de nuevo."
						content={
							<Button onClick={refetch}>
								<RefreshCcw />
								Reintentar
							</Button>
						}
					/>
				</CardContent>
			</Card>
		);
	}

	if (groups.length === 0) {
		return (
			<Card className={className}>
				<CardContent>
					<EmptyState
						title="No tienes grupos asignados"
						description="Aún no te han asignado a ningún grupo."
					/>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="text-base">Grupos</CardTitle>
			</CardHeader>
			<CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{groups?.map((group) => (
					<Card key={group.id}>
						<CardHeader>
							<CardTitle className="text-base">{group.name}</CardTitle>
							<CardDescription>{group.description}</CardDescription>
						</CardHeader>
						{/* `/groups/me` devuelve los grupos sin sus integrantes: sin
						    este control la tarjeta rompía el perfil entero. */}
						{group.users?.length > 0 && (
							<CardFooter>
								<AvatarGroup>
									{group.users.map((user) => (
										<Avatar key={user.id}>
											<AvatarFallback>
												{`${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase() ||
													"?"}
											</AvatarFallback>
										</Avatar>
									))}
								</AvatarGroup>
							</CardFooter>
						)}
					</Card>
				))}
			</CardContent>
		</Card>
	);
}
