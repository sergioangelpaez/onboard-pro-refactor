import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, ListTodo, PartyPopper } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import type {
	PendingActivity,
	StudentPending,
} from "#/lib/services/gamification";
import { tipoDe } from "../activity-type";

/** Color del ícono según el tipo, para distinguirlos de un vistazo. */
const TONO_TIPO: Record<string, string> = {
	Recurso: "bg-sky-500/15 text-sky-600 dark:text-sky-300",
	Tarea: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
	Examen: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
};

const VISIBLES = 4;

function IconoTipo({
	tipo,
	grande = false,
}: {
	tipo: string;
	grande?: boolean;
}) {
	return (
		<span
			className={`flex shrink-0 items-center justify-center rounded-lg ${grande ? "size-12" : "size-9"} ${TONO_TIPO[tipo] ?? TONO_TIPO.Recurso}`}
		>
			{tipoDe(tipo).icono}
		</span>
	);
}

function irA(a: PendingActivity) {
	return {
		to: "/student/courses/$courseId" as const,
		params: { courseId: a.courseId },
	};
}

/**
 * Lo que le falta al aprendiz, en el orden del curso. La primera actividad va
 * destacada como "siguiente paso", con un botón grande: es la respuesta a
 * "¿qué hago ahora?", que es la pregunta con la que se entra.
 */
export function NextSteps({
	data,
	isLoading,
}: {
	data?: StudentPending;
	isLoading: boolean;
}) {
	const pendientes = data?.actividadesPendientes ?? [];
	const total = data?.resumen.actividadesPendientes ?? 0;
	const [siguiente, ...resto] = pendientes;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<ListTodo className="size-4" />
					Pendientes
					{total > 0 && <Badge variant="secondary">{total}</Badge>}
				</CardTitle>
				{data && data.resumen.xpPorGanar > 0 && (
					<span className="font-medium text-primary text-xs">
						{data.resumen.xpPorGanar} XP por ganar
					</span>
				)}
			</CardHeader>

			<CardContent className="space-y-3">
				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-24 w-full rounded-xl" />
						<Skeleton className="h-12 w-full" />
					</div>
				)}

				{data && data.resumen.cursos === 0 && (
					<p className="text-muted-foreground text-sm">
						Todavía no tienes cursos asignados. Cuando te sumen a un equipo con
						cursos, tus actividades van a aparecer acá.
					</p>
				)}

				{data && data.resumen.cursos > 0 && total === 0 && (
					<div className="flex flex-col items-center gap-2 rounded-xl bg-emerald-500/10 py-8 text-center">
						<PartyPopper className="size-8 text-emerald-600 dark:text-emerald-300" />
						<p className="font-medium">¡Estás al día!</p>
						<p className="text-muted-foreground text-sm">
							No te queda nada pendiente.
						</p>
					</div>
				)}

				{siguiente && (
					<div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
						<p className="mb-3 font-medium text-primary text-xs uppercase tracking-wide">
							Tu siguiente paso
						</p>
						<div className="flex flex-wrap items-center gap-4">
							<IconoTipo tipo={siguiente.tipo} grande />
							<div className="min-w-0 flex-1">
								<p className="font-semibold">{siguiente.titulo}</p>
								<p className="truncate text-muted-foreground text-sm">
									{siguiente.curso} · {siguiente.seccion}
								</p>
							</div>
							<Button asChild>
								<Link {...irA(siguiente)}>
									Empezar · {siguiente.xp} XP
									<ArrowRight />
								</Link>
							</Button>
						</div>
					</div>
				)}

				{resto.length > 0 && (
					<ul className="space-y-1">
						{resto.slice(0, VISIBLES).map((a) => (
							<li key={a.id}>
								<Link
									{...irA(a)}
									className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-accent"
								>
									<IconoTipo tipo={a.tipo} />
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium text-sm">{a.titulo}</p>
										<p className="truncate text-muted-foreground text-xs">
											{a.curso} · {a.seccion}
										</p>
									</div>
									<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
										{a.xp} XP
									</span>
									<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
								</Link>
							</li>
						))}
					</ul>
				)}

				{total > VISIBLES + 1 && (
					<p className="px-2 text-muted-foreground text-xs">
						Y {total - VISIBLES - 1} más en tus cursos.
					</p>
				)}
			</CardContent>
		</Card>
	);
}
