import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { CourseCard } from "#/components/home/course-card";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/(dashboard)/home")({
	component: HomeRoute,
	beforeLoad: ({ context }) => {
		if (!context.user) throw redirect({ to: "/auth" });
	},
});

/** El encabezado cambia según quién mira: no es lo mismo dictar que administrar. */
const TITULOS: Record<string, { titulo: string; bajada: string }> = {
	instructor: {
		titulo: "Mis cursos",
		bajada: "Accedé a tus cursos y mirá quién va adelante en cada uno.",
	},
	admin: {
		titulo: "Cursos de la empresa",
		bajada: "El contenido de tu organización y cómo avanza cada curso.",
	},
	superadmin: {
		titulo: "Cursos de la plataforma",
		bajada: "Todos los cursos y los aprendices que van adelante en cada uno.",
	},
	student: {
		titulo: "Mi progreso",
		bajada: "Los cursos que tenés asignados.",
	},
};

function HomeRoute() {
	const { user } = useCurrentUser();
	const { data, isLoading, error, refetch } = useAllCourses();

	const { titulo, bajada } = TITULOS[user?.role ?? "student"] ?? TITULOS.student;

	return (
		<div className="app-container">
			<div className="mb-6">
				<h1>{titulo}</h1>
				<p className="text-muted-foreground text-sm">{bajada}</p>
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
					title="Todavía no hay cursos"
					description="Cuando tengas un curso a cargo va a aparecer acá."
					content={
						<Button asChild>
							<Link to="/courses">Ir a Cursos</Link>
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
