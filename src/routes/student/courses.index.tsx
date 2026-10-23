import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { MyCourseCard } from "#/components/student/my-course-card";
import { Button } from "#/components/ui/button";
import { useMyCourses } from "#/hooks/courses/use-my-courses";

export const Route = createFileRoute("/student/courses/")({
	component: MyCoursesRoute,
});

/** Los cursos que el aprendiz tiene asignados por sus equipos, con su avance. */
function MyCoursesRoute() {
	const { data, isLoading, error, refetch } = useMyCourses();

	return (
		<div className="app-container space-y-6">
			<div>
				<h1>Mis cursos</h1>
				<p className="text-muted-foreground">
					Entra a un curso para ver sus secciones y actividades.
				</p>
			</div>

			{isLoading && <LoadingState message="Cargando tus cursos..." />}

			{!data && error && (
				<ErrorState
					title="No se pudieron cargar tus cursos"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{data && data.length === 0 && (
				<EmptyState
					title="Todavía no tienes cursos"
					description="Cuando te sumen a un equipo con cursos asignados, van a aparecer acá."
				/>
			)}

			{data && data.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{data.map((course) => (
						<MyCourseCard key={course.id} course={course} />
					))}
				</div>
			)}
		</div>
	);
}
