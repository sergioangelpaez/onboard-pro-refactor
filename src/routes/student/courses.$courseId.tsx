import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { progresoDe } from "#/components/student/course-progress";
import { StudentActivityItem } from "#/components/student/student-activity-item";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { useCourseSections } from "#/hooks/courses/use-course-sections";
import { useMyCourses } from "#/hooks/courses/use-my-courses";

export const Route = createFileRoute("/student/courses/$courseId")({
	component: CourseRoute,
});

/**
 * Un curso visto por el aprendiz: sus secciones en orden, cada actividad con
 * su estado, y el avance total arriba.
 *
 * El backend ya le saca las secciones vacías y responde 404 si el curso está
 * despublicado.
 */
function CourseRoute() {
	const { courseId } = Route.useParams();
	const { data: cursos } = useMyCourses();
	const {
		data: secciones,
		isLoading,
		error,
		refetch,
	} = useCourseSections(courseId);

	const curso = cursos?.find((c) => c.id === courseId);
	const { hechas, total, porcentaje } = progresoDe(secciones);
	const terminado = total > 0 && hechas === total;

	return (
		<div className="app-container space-y-6">
			<div className="space-y-3">
				<Button asChild variant="ghost" size="sm" className="-ml-2">
					<Link to="/student/courses">
						<ArrowLeft />
						Mis cursos
					</Link>
				</Button>
				<h1>{curso?.name ?? "Curso"}</h1>

				{secciones && total > 0 && (
					<div className="max-w-md space-y-1.5">
						<div
							role="progressbar"
							aria-label="Avance en el curso"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={porcentaje}
							className="h-2 overflow-hidden rounded-full bg-muted"
						>
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${porcentaje}%` }}
							/>
						</div>
						<p className="flex items-center gap-1.5 text-muted-foreground text-sm">
							{terminado && <CheckCircle2 className="size-4 text-primary" />}
							{terminado
								? "¡Terminaste este curso!"
								: `${hechas} de ${total} actividades · ${porcentaje}%`}
						</p>
					</div>
				)}
			</div>

			{isLoading && <LoadingState message="Cargando el curso..." />}

			{!secciones && error && (
				<ErrorState
					title="No se pudo abrir el curso"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{secciones && secciones.length === 0 && (
				<EmptyState
					title="Este curso todavía no tiene contenido"
					description="Cuando se agreguen actividades van a aparecer acá."
				/>
			)}

			{secciones?.map((seccion) => {
				const hechasSeccion = seccion.actividades.filter(
					(a) => a.completada,
				).length;
				return (
					<Card key={seccion.id}>
						<CardHeader className="flex flex-row items-center justify-between gap-2">
							<CardTitle className="text-base">{seccion.name}</CardTitle>
							<span className="shrink-0 text-muted-foreground text-xs">
								{hechasSeccion}/{seccion.actividades.length}
							</span>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								{seccion.actividades.map((actividad) => (
									<StudentActivityItem
										key={actividad.id}
										actividad={actividad}
										courseId={courseId}
									/>
								))}
							</ul>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
