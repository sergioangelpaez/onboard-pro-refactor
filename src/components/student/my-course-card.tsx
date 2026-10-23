import { Link } from "@tanstack/react-router";
import { CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useCourseSections } from "#/hooks/courses/use-course-sections";
import type { Course } from "#/lib/schemas/courses";
import { progresoDe } from "./course-progress";

/**
 * Un curso en "Mis cursos" del aprendiz, con cuánto lleva hecho.
 *
 * El avance sale de las secciones del curso, que para el aprendiz ya traen
 * qué actividad está completada. Es la misma consulta que usa la pantalla del
 * curso, así que al entrar ya está en cache.
 */
export function MyCourseCard({ course }: { course: Course }) {
	const { data: secciones, isLoading } = useCourseSections(course.id);
	const { hechas, total, porcentaje } = progresoDe(secciones);
	const terminado = total > 0 && hechas === total;

	return (
		<Link
			to="/student/courses/$courseId"
			params={{ courseId: course.id }}
			className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
		>
			<Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
				<CardHeader>
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="line-clamp-2 min-w-0 flex-1 group-hover:underline">
							{course.name}
						</CardTitle>
						<ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
					</div>
				</CardHeader>

				<CardContent className="space-y-2">
					{isLoading ? (
						<Skeleton className="h-2 w-full" />
					) : (
						<div
							role="progressbar"
							aria-label={`Avance en ${course.name}`}
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
					)}

					<p className="flex items-center gap-1.5 text-muted-foreground text-sm">
						{terminado && <CheckCircle2 className="size-4 text-primary" />}
						{isLoading
							? "Calculando tu avance..."
							: total === 0
								? "Todavía no tiene actividades."
								: terminado
									? "¡Curso terminado!"
									: `${hechas} de ${total} actividades · ${porcentaje}%`}
					</p>
				</CardContent>
			</Card>
		</Link>
	);
}
