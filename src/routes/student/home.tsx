import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCheck, LibraryBig, RefreshCw } from "lucide-react";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { LevelCard } from "#/components/student/level-card";
import { PendingCard } from "#/components/student/pending-card";
import { StreakCard } from "#/components/student/streak-card";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useMyProgress } from "#/hooks/gamification/use-my-progress";
import { useCurrentUser } from "#/hooks/users/use-current-user";

export const Route = createFileRoute("/student/home")({
	component: HomeRoute,
});

/**
 * El inicio del aprendiz: cómo viene su progreso y un acceso directo a lo que
 * le queda por hacer. La racha va primero porque es lo único que se pierde si
 * no entra hoy.
 */
function HomeRoute() {
	const { user } = useCurrentUser();
	const { data, isLoading, error, refetch } = useMyProgress();

	return (
		<div className="app-container space-y-6">
			<div>
				<h1>{user?.firstname ? `¡Hola, ${user.firstname}!` : "¡Hola!"}</h1>
				<p className="text-muted-foreground">Así va tu progreso.</p>
			</div>

			{isLoading && <LoadingState message="Cargando tu progreso..." />}

			{!data && error && (
				<ErrorState
					title="No se pudo cargar tu progreso"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{data && (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					<StreakCard racha={data.racha} />
					<LevelCard progreso={data} />

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base">
								<CheckCheck className="size-4" />
								Actividades completadas
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="font-semibold text-3xl tabular-nums">
								{data.actividadesCompletadas}
							</p>
							<Button asChild variant="outline" className="w-full">
								<Link to="/student/courses">
									<LibraryBig />
									Ver mis cursos
								</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Fuera del bloque de progreso: si ese falla, lo pendiente se sigue viendo. */}
			<PendingCard />
		</div>
	);
}
