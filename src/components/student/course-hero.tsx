import { ArrowRight, CheckCircle2, Layers, Sparkles, Star } from "lucide-react";
import { Button } from "#/components/ui/button";
import type { Section, SectionActivity } from "#/lib/schemas/courses";
import { tipoDe } from "./activity-type";

/**
 * La cabecera del curso para el aprendiz: cuánto lleva, qué ganó, qué le
 * falta y por dónde seguir. Todo sale de las secciones (que ya traen qué está
 * completada) y del XP ganado en el curso, que viene del ranking.
 */
export function CourseHero({
	secciones,
	xpGanado,
	onSeguir,
}: {
	secciones: Section[];
	xpGanado: number | null;
	onSeguir: (actividad: SectionActivity) => void;
}) {
	const actividades = secciones.flatMap((s) => s.actividades);
	const total = actividades.length;
	const hechas = actividades.filter((a) => a.completada).length;
	const porcentaje = total ? Math.round((hechas * 100) / total) : 0;
	const terminado = total > 0 && hechas === total;
	const seccionesHechas = secciones.filter(
		(s) => s.actividades.length > 0 && s.actividades.every((a) => a.completada),
	).length;
	const xpPorGanar = actividades
		.filter((a) => !a.completada)
		.reduce((t, a) => t + (a.xp ?? 0), 0);
	// En el orden del curso: la primera sin terminar es la que sigue.
	const siguiente = actividades.find((a) => !a.completada);

	return (
		<section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/15 via-primary/5 to-background p-6">
			<div
				aria-hidden
				className="-right-12 -top-12 absolute size-44 rounded-full bg-primary/15 blur-3xl"
			/>

			<div className="relative grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
				{/* El porcentaje en grande, dentro de un anillo. */}
				<div
					className="relative mx-auto flex size-28 items-center justify-center rounded-full"
					style={{
						background: `conic-gradient(var(--color-primary) ${porcentaje * 3.6}deg, color-mix(in oklab, var(--color-primary) 12%, transparent) 0deg)`,
					}}
					role="progressbar"
					aria-label="Avance en el curso"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={porcentaje}
				>
					<div className="flex size-22 flex-col items-center justify-center rounded-full bg-background">
						{terminado ? (
							<CheckCircle2 className="size-9 text-primary" />
						) : (
							<span className="font-semibold text-2xl tabular-nums">
								{porcentaje}%
							</span>
						)}
						<span className="text-muted-foreground text-xs">
							{hechas}/{total}
						</span>
					</div>
				</div>

				<div className="space-y-4">
					<div className="grid grid-cols-3 gap-3">
						<Dato
							icono={<Layers className="size-4" />}
							valor={`${seccionesHechas}/${secciones.length}`}
							etiqueta="secciones completas"
						/>
						<Dato
							icono={<Star className="size-4 fill-current" />}
							tono="text-amber-600 dark:text-amber-300"
							valor={xpGanado ?? "—"}
							etiqueta="XP ganado aquí"
						/>
						<Dato
							icono={<Sparkles className="size-4" />}
							tono="text-violet-600 dark:text-violet-300"
							valor={xpPorGanar}
							etiqueta="XP por ganar"
						/>
					</div>

					{terminado ? (
						<p className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-4 py-3 font-medium text-emerald-700 text-sm dark:text-emerald-300">
							<CheckCircle2 className="size-4" />
							¡Terminaste este curso! Puedes volver a revisar el material cuando
							quieras.
						</p>
					) : (
						siguiente && (
							<div className="flex flex-wrap items-center gap-3 rounded-xl border bg-background/70 px-4 py-3">
								<span className="text-muted-foreground">
									{tipoDe(siguiente.type).icono}
								</span>
								<div className="min-w-0 flex-1">
									<p className="text-muted-foreground text-xs">Sigue con</p>
									<p className="truncate font-medium">{siguiente.title}</p>
								</div>
								<Button size="sm" onClick={() => onSeguir(siguiente)}>
									Continuar
									<ArrowRight />
								</Button>
							</div>
						)
					)}
				</div>
			</div>
		</section>
	);
}

function Dato({
	icono,
	valor,
	etiqueta,
	tono = "text-primary",
}: {
	icono: React.ReactNode;
	valor: React.ReactNode;
	etiqueta: string;
	tono?: string;
}) {
	return (
		<div className="rounded-xl bg-background/70 p-3">
			<p
				className={`flex items-center gap-1.5 font-semibold text-xl tabular-nums ${tono}`}
			>
				{icono}
				{valor}
			</p>
			<p className="mt-0.5 text-muted-foreground text-xs">{etiqueta}</p>
		</div>
	);
}
