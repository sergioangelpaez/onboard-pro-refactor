import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { CourseCard } from "#/components/admin/home/course-card";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Button } from "#/components/ui/button";
import { useAllCourses } from "#/hooks/courses/use-all-courses";

export const Route = createFileRoute("/instructor/home")({
	component: HomeRoute,
});

/**
 * El resumen de quien dicta: sus cursos como acceso rápido y, en cada uno, los
 * tres aprendices que van adelante.
 *
 * El listado no se filtra acá: `coursesRoutes` ya le devuelve al instructor
 * solo los cursos que dicta.
 */
function HomeRoute() {
	const { data, isLoading, error, refetch } = useAllCourses();

	return (
		<div className="app-container">
			<div className="mb-6">
				<h1>Mis cursos</h1>
				<p className="text-muted-foreground text-sm">
					Accedé a tus cursos y mirá quién va adelante en cada uno.
				</p>
			</div>

			{isLoading && <LoadingState message="Cargando tus cursos..." />}

			{!data && error && (
				<ErrorState
					title="No se pudieron cargar los cursos"
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
					title="Todavía no tenés cursos a cargo"
					description="Cuando te asignen uno va a aparecer acá."
					content={
						<Button asChild>
							<Link to="/instructor/courses">Ir a Mis cursos</Link>
						</Button>
					}
				/>
			)}

			{data && data.length > 0 && (
				<div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,20rem),1fr))] gap-4">
					{data.map((course) => (
						<CourseCard key={course.id} course={course} />
					))}
				</div>
			)}
		</div>
	);
}
