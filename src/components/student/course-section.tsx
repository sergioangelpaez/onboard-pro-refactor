import { Check, ChevronDown, Star } from "lucide-react";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import type { Section } from "#/lib/schemas/courses";
import { StudentActivityItem } from "./student-activity-item";

/**
 * Una sección del curso para el aprendiz, plegable: en la cabecera va el
 * número, cuánto lleva y el XP; al abrirla, sus actividades.
 */
export function CourseSection({
	seccion,
	numero,
	courseId,
	abierta,
	onAbrir,
	actual,
	destacada,
}: {
	seccion: Section;
	numero: number;
	courseId: string;
	abierta: boolean;
	onAbrir: (abierta: boolean) => void;
	/** La sección donde está la próxima actividad pendiente. */
	actual: boolean;
	destacada: string | null;
}) {
	const total = seccion.actividades.length;
	const hechas = seccion.actividades.filter((a) => a.completada).length;
	const terminada = total > 0 && hechas === total;
	const porcentaje = total ? Math.round((hechas * 100) / total) : 0;
	const xp = seccion.actividades.reduce((t, a) => t + (a.xp ?? 0), 0);

	return (
		<Collapsible
			open={abierta}
			onOpenChange={onAbrir}
			className={`overflow-hidden rounded-xl border bg-card transition-shadow ${actual ? "border-primary/40 shadow-sm" : ""}`}
		>
			<CollapsibleTrigger className="group flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-accent/50">
				<span
					className={`flex size-9 shrink-0 items-center justify-center rounded-full font-semibold text-sm ${
						terminada
							? "bg-primary text-primary-foreground"
							: actual
								? "bg-primary/15 text-primary ring-2 ring-primary/30"
								: "bg-muted text-muted-foreground"
					}`}
				>
					{terminada ? <Check className="size-4" /> : numero}
				</span>

				<div className="min-w-0 flex-1 space-y-1.5">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
						<span className="font-medium">{seccion.name}</span>
						{actual && (
							<span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary text-xs">
								En curso
							</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<div className="h-1.5 max-w-48 flex-1 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${porcentaje}%` }}
							/>
						</div>
						<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
							{hechas}/{total} actividades
						</span>
					</div>
				</div>

				<span className="hidden shrink-0 items-center gap-1 text-muted-foreground text-xs sm:flex">
					<Star className="size-3.5 fill-amber-400 text-amber-500" />
					{xp} XP
				</span>
				<ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
			</CollapsibleTrigger>

			<CollapsibleContent>
				<ul className="space-y-2 border-t bg-muted/20 p-4">
					{seccion.actividades.map((actividad) => (
						<StudentActivityItem
							key={actividad.id}
							actividad={actividad}
							courseId={courseId}
							destacada={destacada === actividad.id}
						/>
					))}
				</ul>
			</CollapsibleContent>
		</Collapsible>
	);
}
