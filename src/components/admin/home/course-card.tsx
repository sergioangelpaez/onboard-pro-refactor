import { Link } from "@tanstack/react-router";
import { ChevronRight, Medal, Trophy } from "lucide-react";
import { useCourseRanking } from "#/hooks/gamification/use-course-ranking";
import type { Course } from "#/lib/schemas/courses";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";

/** Oro, plata y bronce. El resto, el color normal del texto. */
const COLOR_PUESTO = ["text-amber-500", "text-zinc-400", "text-amber-700"];

/**
 * Un curso en el resumen del instructor: acceso directo al curso y, debajo,
 * los tres aprendices con más XP *de ese curso*.
 *
 * El ranking es por curso y no el general de la organización: a quien dicta le
 * sirve saber cómo va su gente en lo suyo, no quién lleva más puntos en total.
 */
export function CourseCard({ course }: { course: Course }) {
	const { data: ranking, isLoading } = useCourseRanking(course.id);

	return (
		<Link
			to="/instructor/courses/$courseId"
			params={{ courseId: course.id }}
			className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
		>
			<Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
			<CardHeader className="gap-2">
				<div className="flex items-start justify-between gap-2">
					<CardTitle className="line-clamp-2 min-w-0 flex-1 group-hover:underline">
						{course.name}
					</CardTitle>

					<ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<Badge variant={course.status === "Abierto" ? "default" : "outline"}>
						{course.status}
					</Badge>
					<span className="text-muted-foreground text-xs">
						{course.actividades.length}{" "}
						{course.actividades.length === 1 ? "actividad" : "actividades"}
					</span>
				</div>
			</CardHeader>

			<CardContent>
				<p className="mb-2 flex items-center gap-1.5 font-medium text-muted-foreground text-xs">
					<Trophy className="size-3.5" />
					Mejores del curso
				</p>

				{isLoading && (
					<div className="space-y-1.5">
						<Skeleton className="h-5 w-full" />
						<Skeleton className="h-5 w-4/5" />
					</div>
				)}

				{!isLoading && (!ranking || ranking.length === 0) && (
					<p className="text-muted-foreground text-sm">
						Todavía nadie completó actividades de este curso.
					</p>
				)}

				{ranking && ranking.length > 0 && (
					<ol className="space-y-1">
						{ranking.map((p) => (
							<li key={p.id} className="flex items-center gap-2 text-sm">
								<Medal
									className={`size-4 shrink-0 ${COLOR_PUESTO[p.posicion - 1] ?? ""}`}
								/>
								<span className="min-w-0 flex-1 truncate">
									{p.firstname} {p.lastname}
								</span>
								<span className="shrink-0 text-muted-foreground text-xs">
									{p.xp} XP
								</span>
							</li>
						))}
					</ol>
				)}
			</CardContent>
			</Card>
		</Link>
	);
}
