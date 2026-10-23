import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, Layers, Star } from "lucide-react";
import { Card } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useCourseSections } from "#/hooks/courses/use-course-sections";
import type { Course, Section } from "#/lib/schemas/courses";
import { progresoDe } from "./course-progress";

export type EstadoCurso = "nuevo" | "enCurso" | "terminado" | "vacio";

/** En qué punto está el aprendiz con un curso, según sus secciones. */
export function estadoDe(secciones: Section[] | undefined): EstadoCurso {
	const { hechas, total } = progresoDe(secciones);
	if (total === 0) return "vacio";
	if (hechas === total) return "terminado";
	return hechas === 0 ? "nuevo" : "enCurso";
}

const ESTADO: Record<
	EstadoCurso,
	{ etiqueta: string; clase: string; accion: string }
> = {
	nuevo: {
		etiqueta: "Por empezar",
		clase: "bg-background/90 text-foreground",
		accion: "Empezar",
	},
	enCurso: {
		etiqueta: "En curso",
		clase: "bg-amber-400 text-amber-950",
		accion: "Continuar",
	},
	terminado: {
		etiqueta: "Terminado",
		clase: "bg-emerald-500 text-white",
		accion: "Repasar",
	},
	vacio: {
		etiqueta: "Sin contenido",
		clase: "bg-background/90 text-muted-foreground",
		accion: "Ver curso",
	},
};

// Portadas para los cursos sin imagen: siempre la misma para el mismo curso.
const PORTADAS = [
	"from-blue-600 to-indigo-500",
	"from-sky-500 to-cyan-400",
	"from-violet-600 to-fuchsia-500",
	"from-emerald-600 to-teal-400",
	"from-orange-500 to-amber-400",
	"from-rose-500 to-pink-400",
];
function portadaDe(id: string) {
	let h = 0;
	for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
	return PORTADAS[h % PORTADAS.length];
}

/**
 * Un curso en "Mis cursos" del aprendiz: portada, en qué punto va, qué tiene
 * y por dónde seguir.
 *
 * El avance sale de las secciones del curso, que para el aprendiz ya traen
 * qué actividad está completada. Es la misma consulta que usa la pantalla del
 * curso, así que al entrar ya está en cache.
 */
export function MyCourseCard({ course }: { course: Course }) {
	const { data: secciones, isLoading } = useCourseSections(course.id);
	const { hechas, total, porcentaje } = progresoDe(secciones);
	const estado = ESTADO[estadoDe(secciones)];
	const actividades = (secciones ?? []).flatMap((s) => s.actividades);
	const xp = actividades.reduce((t, a) => t + (a.xp ?? 0), 0);
	const siguiente = actividades.find((a) => !a.completada);

	return (
		<Link
			to="/student/courses/$courseId"
			params={{ courseId: course.id }}
			className="group block h-full rounded-xl focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
		>
			<Card className="flex h-full flex-col gap-0 overflow-hidden py-0 transition-all group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md">
				{/* Portada */}
				<div
					className={`relative h-24 bg-gradient-to-br ${course.bannerUrl ? "" : portadaDe(course.id)}`}
				>
					{course.bannerUrl ? (
						<img
							src={course.bannerUrl}
							alt=""
							className="size-full object-cover"
						/>
					) : (
						<BookOpen
							aria-hidden
							className="-bottom-4 absolute right-3 size-24 text-white/20 transition-transform group-hover:rotate-6"
						/>
					)}
					{!isLoading && (
						<span
							className={`absolute top-3 left-3 rounded-full px-2.5 py-0.5 font-medium text-xs shadow-sm ${estado.clase}`}
						>
							{estado.etiqueta}
						</span>
					)}
				</div>

				<div className="flex flex-1 flex-col gap-3 p-5">
					<div className="space-y-1">
						<h3 className="line-clamp-2 font-semibold leading-snug">
							{course.name}
						</h3>
						{isLoading ? (
							<Skeleton className="h-4 w-40" />
						) : (
							<p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
								<span className="flex items-center gap-1">
									<Layers className="size-3.5" />
									{secciones?.length ?? 0} secciones · {total} actividades
								</span>
								{xp > 0 && (
									<span className="flex items-center gap-1">
										<Star className="size-3.5 fill-amber-400 text-amber-500" />
										{xp} XP
									</span>
								)}
							</p>
						)}
					</div>

					{isLoading ? (
						<Skeleton className="h-2 w-full" />
					) : (
						<div className="flex items-center gap-3">
							<div
								role="progressbar"
								aria-label={`Avance en ${course.name}`}
								aria-valuemin={0}
								aria-valuemax={100}
								aria-valuenow={porcentaje}
								className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
							>
								<div
									className={`h-full rounded-full transition-all ${porcentaje === 100 ? "bg-emerald-500" : "bg-primary"}`}
									style={{ width: `${porcentaje}%` }}
								/>
							</div>
							<span className="shrink-0 font-medium text-xs tabular-nums">
								{hechas}/{total}
							</span>
						</div>
					)}

					{/* Pie: lo que sigue y la acción, siempre abajo. */}
					<div className="mt-auto flex items-end justify-between gap-3 border-t pt-3">
						<p className="min-w-0 text-xs">
							{siguiente ? (
								<>
									<span className="block text-muted-foreground">Sigue con</span>
									<span className="line-clamp-1 font-medium">
										{siguiente.title}
									</span>
								</>
							) : total > 0 ? (
								<span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
									<CheckCircle2 className="size-4" />
									¡Curso completo!
								</span>
							) : (
								<span className="text-muted-foreground">
									Todavía no tiene actividades.
								</span>
							)}
						</p>
						<span className="flex shrink-0 items-center gap-1 font-medium text-primary text-sm">
							{estado.accion}
							<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
						</span>
					</div>
				</div>
			</Card>
		</Link>
	);
}
