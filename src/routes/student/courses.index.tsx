import { useQueries } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import {
	type EstadoCurso,
	estadoDe,
	MyCourseCard,
} from "#/components/student/my-course-card";
import { Button } from "#/components/ui/button";
import { useMyCourses } from "#/hooks/courses/use-my-courses";
import { coursesService } from "#/lib/services/courses";
import { queryKeys } from "#/lib/utils/query-keys";

export const Route = createFileRoute("/student/courses/")({
	component: MyCoursesRoute,
});

type Filtro = "todos" | Exclude<EstadoCurso, "vacio">;

const FILTROS: { valor: Filtro; etiqueta: string }[] = [
	{ valor: "todos", etiqueta: "Todos" },
	{ valor: "enCurso", etiqueta: "En curso" },
	{ valor: "nuevo", etiqueta: "Por empezar" },
	{ valor: "terminado", etiqueta: "Terminados" },
];

/** Los cursos que el aprendiz tiene asignados por sus equipos, con su avance. */
function MyCoursesRoute() {
	const { data, isLoading, error, refetch } = useMyCourses();
	const [filtro, setFiltro] = useState<Filtro>("todos");

	// Las mismas consultas que hace cada tarjeta: comparten cache, así que
	// contar y filtrar por estado no pide nada de más.
	const secciones = useQueries({
		queries: (data ?? []).map((c) => ({
			queryKey: queryKeys.sections.byCourse(c.id),
			queryFn: () => coursesService.getSections(c.id),
		})),
	});
	const estados = new Map(
		(data ?? []).map((c, i) => [
			c.id,
			secciones[i]?.data ? estadoDe(secciones[i].data) : null,
		]),
	);
	const cuantos = (f: Filtro) =>
		f === "todos"
			? (data?.length ?? 0)
			: [...estados.values()].filter((e) => e === f).length;
	const visibles = (data ?? []).filter(
		(c) => filtro === "todos" || estados.get(c.id) === filtro,
	);

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
				<>
					<div className="flex flex-wrap gap-2" role="tablist">
						{FILTROS.map((f) => (
							<button
								key={f.valor}
								type="button"
								role="tab"
								aria-selected={filtro === f.valor}
								onClick={() => setFiltro(f.valor)}
								className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-medium text-sm transition-colors ${
									filtro === f.valor
										? "border-primary bg-primary text-primary-foreground"
										: "bg-card hover:bg-accent"
								}`}
							>
								{f.etiqueta}
								<span
									className={`rounded-full px-1.5 text-xs tabular-nums ${
										filtro === f.valor
											? "bg-primary-foreground/20"
											: "bg-muted text-muted-foreground"
									}`}
								>
									{cuantos(f.valor)}
								</span>
							</button>
						))}
					</div>

					{visibles.length === 0 ? (
						<EmptyState
							title="No hay cursos acá"
							description="Prueba con otro filtro."
						/>
					) : (
						<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
							{visibles.map((course) => (
								<MyCourseCard key={course.id} course={course} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
