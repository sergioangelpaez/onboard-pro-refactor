import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { ActivityMaterials } from "#/components/activities/activity-materials";
import { ActivitySubmissions } from "#/components/activities/activity-submissions";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { useAllActivities } from "#/hooks/activities/use-all-activities";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { puedeEditarContenido } from "#/lib/utils/roles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute(
	"/(dashboard)/(activities)/activities/$activityId",
)({ component: ActivityDetailRoute });

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
	return (
		<div>
			<dt className="text-muted-foreground text-xs">{etiqueta}</dt>
			<dd className="text-sm">{valor}</dd>
		</div>
	);
}

function ActivityDetailRoute() {
	const { activityId } = Route.useParams();
	const { user } = useCurrentUser();

	// El backend no tiene GET /activities/:id todavía, así que la actividad sale
	// del listado, que de todos modos ya suele estar en cache.
	const { data, isLoading, error, refetch } = useAllActivities();
	const activity = data?.find((a) => a.id === activityId);

	const puedeEditar = puedeEditarContenido(user?.role);

	if (isLoading) return <LoadingState message="Cargando la actividad..." />;

	if (error) {
		return (
			<div className="app-container">
				<ErrorState
					title="No se pudo cargar la actividad"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			</div>
		);
	}

	if (!activity) {
		return (
			<div className="app-container">
				<EmptyState
					title="Actividad no encontrada"
					description="No existe, o pertenece a otra organización."
					content={
						<Button asChild>
							<Link to="/courses">Volver a los cursos</Link>
						</Button>
					}
				/>
			</div>
		);
	}

	return (
		<div className="app-container space-y-6">
			<div>
				<Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
					{activity.courseId ? (
						<Link
							to="/courses/$courseId"
							params={{ courseId: activity.courseId }}
						>
							<ArrowLeft />
							{activity.courseName ?? "Curso"}
						</Link>
					) : (
						<Link to="/courses">
							<ArrowLeft />
							Cursos
						</Link>
					)}
				</Button>

				<div className="flex flex-wrap items-center gap-2">
					<h1>{activity.title}</h1>
					<Badge variant="secondary">{activity.type}</Badge>
					{activity.deliverable && <Badge variant="outline">Entregable</Badge>}
				</div>

				{activity.description && (
					<p className="mt-1 text-muted-foreground text-sm">
						{activity.description}
					</p>
				)}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Detalles</CardTitle>
				</CardHeader>
				<CardContent>
					<dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
						<Dato etiqueta="Curso" valor={activity.courseName ?? "—"} />
						<Dato etiqueta="Sección" valor={activity.sectionName ?? "—"} />
						<Dato etiqueta="XP" valor={`${activity.xp} puntos`} />
						<Dato
							etiqueta="Creada"
							valor={new Date(activity.created_at).toLocaleDateString("es-CO", {
								year: "numeric",
								month: "short",
								day: "numeric",
							})}
						/>
					</dl>
				</CardContent>
			</Card>

			<ActivityMaterials activityId={activity.id} puedeEditar={puedeEditar} />

			{/* Las entregas solo existen si la actividad las pide, y solo las revisa
			    quien dicta o administra el curso. */}
			{activity.deliverable && puedeEditar && (
				<ActivitySubmissions activityId={activity.id} />
			)}
		</div>
	);
}
