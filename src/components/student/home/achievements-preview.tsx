import { Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import type { MisLogros } from "#/lib/services/logros";

/**
 * Los logros en el inicio: lo ya ganado como insignias y, debajo, los más
 * cercanos a ganarse con su barra. Lo que motiva es ver qué falta poco para
 * conseguir, no la lista completa.
 */
export function AchievementsPreview({
	data,
	isLoading,
}: {
	data?: MisLogros;
	isLoading: boolean;
}) {
	const ganados = (data?.logros ?? []).filter((l) => l.desbloqueado);
	// Los de ranking no tienen un avance con sentido ("puesto 5 de meta 3"):
	// como próximos se muestran los que sí se pueden medir.
	const proximos = (data?.logros ?? [])
		.filter((l) => !l.desbloqueado && l.condicion.tipo !== "posicion_ranking")
		.slice(0, 2);

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="flex items-center gap-2 text-base">
					<Medal className="size-4" />
					Logros
				</CardTitle>
				{data && (
					<span className="text-muted-foreground text-xs tabular-nums">
						{data.ganados} de {data.total}
					</span>
				)}
			</CardHeader>

			<CardContent className="space-y-5">
				{isLoading && <Skeleton className="h-28 w-full" />}

				{data && data.total === 0 && (
					<p className="text-muted-foreground text-sm">
						Tu organización todavía no tiene logros.
					</p>
				)}

				{ganados.length > 0 && (
					<ul className="flex flex-wrap gap-3">
						{ganados.slice(0, 8).map((l) => (
							<li key={l.id}>
								<Tooltip>
									<TooltipTrigger asChild>
										{/* Botón y no span: así el tooltip también se abre con el teclado. */}
										<button
											type="button"
											aria-label={l.nombre}
											className={`flex size-12 cursor-default items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-amber-400/20 text-2xl ring-2 transition-transform hover:scale-110 ${l.nuevo ? "ring-amber-400" : "ring-violet-500/30"}`}
										>
											{l.icono}
										</button>
									</TooltipTrigger>
									<TooltipContent className="max-w-56 text-center">
										<p className="font-semibold">{l.nombre}</p>
										{l.condicion.descripcion && (
											<p>{l.condicion.descripcion}</p>
										)}
										{l.desbloqueadoAt && (
											<p className="opacity-80">
												Ganado el{" "}
												{new Date(l.desbloqueadoAt).toLocaleDateString("es", {
													dateStyle: "medium",
												})}
												{l.xpRecompensa > 0 ? ` · +${l.xpRecompensa} XP` : ""}
											</p>
										)}
									</TooltipContent>
								</Tooltip>
							</li>
						))}
					</ul>
				)}

				{data && data.total > 0 && ganados.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Todavía no ganaste ninguno. ¡Completa actividades para desbloquear
						el primero!
					</p>
				)}

				{proximos.length > 0 && (
					<div className="space-y-3">
						<p className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
							Te falta poco
						</p>
						{proximos.map((l) => (
							<div key={l.id} className="space-y-1.5">
								<div className="flex items-center gap-2 text-sm">
									<span className="text-lg opacity-60 grayscale">
										{l.icono}
									</span>
									<span className="min-w-0 flex-1 truncate font-medium">
										{l.nombre}
									</span>
									<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
										{l.progreso.actual ?? 0}/{l.progreso.meta}
									</span>
								</div>
								<div className="h-1.5 overflow-hidden rounded-full bg-muted">
									<div
										className="h-full rounded-full bg-violet-500"
										style={{ width: `${Math.max(l.progreso.porcentaje, 3)}%` }}
									/>
								</div>
								{l.condicion.descripcion && (
									<p className="text-muted-foreground text-xs">
										{l.condicion.descripcion}
									</p>
								)}
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
