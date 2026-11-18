import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ChevronsUpDown, RefreshCw } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { CourseHero } from "#/components/student/course-hero";
import { CoursePeople } from "#/components/student/course-people";
import { progresoDe } from "#/components/student/course-progress";
import { CourseRankingCard } from "#/components/student/course-ranking-card";
import { CourseSection } from "#/components/student/course-section";
import { Button } from "#/components/ui/button";
import { useCourseSections } from "#/hooks/courses/use-course-sections";
import { useMyCourses } from "#/hooks/courses/use-my-courses";
import { useCourseRanking } from "#/hooks/gamification/use-course-ranking";
import { useCurrentUser } from "#/hooks/users/use-current-user";

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
	const { total } = progresoDe(secciones);
	// La misma consulta que la tarjeta de ranking: comparten cache.
	const { user } = useCurrentUser();
	const { data: ranking } = useCourseRanking(courseId, 500);
	const yo = ranking?.find((p) => p.id === user?.id);
	const [destacada, setDestacada] = useState<string | null>(null);

	// La sección de la próxima actividad pendiente arranca abierta; el resto,
	// plegada. Hasta que el aprendiz toque algo, se sigue esa regla.
	const seccionActual = secciones?.find((s) =>
		s.actividades.some((a) => !a.completada),
	)?.id;
	const [abiertas, setAbiertas] = useState<Set<string> | null>(null);
	const abiertasEfectivas =
		abiertas ?? new Set(seccionActual ? [seccionActual] : []);
	const todasAbiertas =
		!!secciones?.length && secciones.every((s) => abiertasEfectivas.has(s.id));

	// "Continuar" lleva a una actividad: su sección tiene que estar abierta.
	function seguir(actividadId: string) {
		const seccion = secciones?.find((s) =>
			s.actividades.some((a) => a.id === actividadId),
		);
		if (seccion) setAbiertas(new Set(abiertasEfectivas).add(seccion.id));
		setDestacada(actividadId);
	}

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
				<CoursePeople courseId={courseId} />
			</div>

			{/* Cómo va en el curso y quién va adelante, lado a lado. */}
			{secciones && total > 0 && (
				<div className="grid gap-4 lg:grid-cols-3">
					<div className="lg:col-span-2 [&>*]:h-full">
						<CourseHero
							secciones={secciones}
							xpGanado={yo?.xp ?? (ranking ? 0 : null)}
							onSeguir={(a) => seguir(a.id)}
						/>
					</div>
					<CourseRankingCard courseId={courseId} />
				</div>
			)}

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

			{secciones && secciones.length > 0 && (
				<div className="space-y-3">
					<div className="flex items-center justify-between gap-2">
						<h2 className="font-semibold text-lg">Contenido del curso</h2>
						<Button
							variant="ghost"
							size="sm"
							onClick={() =>
								setAbiertas(
									todasAbiertas
										? new Set()
										: new Set(secciones.map((s) => s.id)),
								)
							}
						>
							<ChevronsUpDown />
							{todasAbiertas ? "Contraer todo" : "Expandir todo"}
						</Button>
					</div>
					{secciones.map((seccion, i) => (
						<CourseSection
							key={seccion.id}
							seccion={seccion}
							numero={i + 1}
							courseId={courseId}
							actual={seccion.id === seccionActual}
							abierta={abiertasEfectivas.has(seccion.id)}
							onAbrir={(abierta) => {
								const nuevas = new Set(abiertasEfectivas);
								if (abierta) nuevas.add(seccion.id);
								else nuevas.delete(seccion.id);
								setAbiertas(nuevas);
							}}
							destacada={destacada}
						/>
					))}
				</div>
			)}
		</div>
	);
}
