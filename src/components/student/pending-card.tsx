import { Link } from "@tanstack/react-router";
import { ChevronRight, ListTodo, PartyPopper } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useMyPending } from "#/hooks/gamification/use-my-pending";
import { tipoDe } from "./activity-type";

/** Cuántas se muestran en el inicio; el resto se ve entrando a cada curso. */
const VISIBLES = 5;

/**
 * Lo que le falta hacer al aprendiz, en el orden en que sus cursos lo
 * presentan: lo primero de la lista es lo siguiente que le toca.
 *
 * Solo de sus cursos publicados y sin lo que ya completó. Cada fila lleva al
 * curso, que es donde se hace la actividad.
 */
export function PendingCard() {
	const { data, isLoading, error } = useMyPending();
	const pendientes = data?.actividadesPendientes ?? [];
	const total = data?.resumen.actividadesPendientes ?? 0;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<ListTodo className="size-4" />
					Pendientes
					{total > 0 && <Badge variant="secondary">{total}</Badge>}
				</CardTitle>
				{data && data.resumen.xpPorGanar > 0 && (
					<span className="text-muted-foreground text-xs">
						{data.resumen.xpPorGanar} XP por ganar
					</span>
				)}
			</CardHeader>

			<CardContent className="space-y-3">
				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-4/5" />
					</div>
				)}

				{error && !data && (
					<p className="text-muted-foreground text-sm">
						No se pudieron cargar tus pendientes: {error.message}
					</p>
				)}

				{data && data.resumen.cursos === 0 && (
					<p className="text-muted-foreground text-sm">
						Todavía no tienes cursos asignados. Cuando te sumen a un equipo con
						cursos, tus actividades van a aparecer acá.
					</p>
				)}

				{data && data.resumen.cursos > 0 && total === 0 && (
					<p className="flex items-center gap-2 text-sm">
						<PartyPopper className="size-4 text-primary" />
						¡Estás al día! No te queda nada pendiente.
					</p>
				)}

				{pendientes.length > 0 && (
					<ul className="space-y-2">
						{pendientes.slice(0, VISIBLES).map((a) => {
							const tipo = tipoDe(a.tipo);
							return (
								<li key={a.id}>
									<Link
										to="/student/courses/$courseId"
										params={{ courseId: a.courseId }}
										className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent"
									>
										<span className="text-muted-foreground">{tipo.icono}</span>
										<div className="min-w-0 flex-1">
											<p className="truncate font-medium text-sm">{a.titulo}</p>
											<p className="truncate text-muted-foreground text-xs">
												{a.curso} · {a.seccion}
											</p>
										</div>
										<Badge variant="secondary" className="shrink-0">
											{tipo.etiqueta}
										</Badge>
										<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
											{a.xp} XP
										</span>
										<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
									</Link>
								</li>
							);
						})}
					</ul>
				)}

				{total > VISIBLES && (
					<p className="text-muted-foreground text-xs">
						Y {total - VISIBLES} más en tus cursos.
					</p>
				)}

				{data && data.resumen.cursos > 0 && (
					<Button asChild variant="outline" className="w-full">
						<Link to="/student/courses">Ver mis cursos</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
