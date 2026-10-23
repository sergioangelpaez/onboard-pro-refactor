import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Card, CardContent } from "#/components/ui/card";
import { useMyAchievements } from "#/hooks/achievements/use-my-achievements";
import type { MiLogro } from "#/lib/services/logros";

export const Route = createFileRoute("/student/logros")({
	component: MisLogrosRoute,
});

function fecha(iso: string | null) {
	return iso
		? new Date(iso).toLocaleDateString("es", { dateStyle: "medium" })
		: "";
}

/**
 * Todos los logros que puede ganar el aprendiz: los ganados como insignias a
 * color, con la fecha, y los que faltan en gris con cuánto lleva. El backend
 * evalúa los pendientes antes de responder, así que si alguno se acaba de
 * cumplir aparece ya ganado.
 */
function MisLogrosRoute() {
	const { data, isLoading, error } = useMyAchievements();
	const ganados = data?.logros.filter((l) => l.desbloqueado) ?? [];
	const faltan = data?.logros.filter((l) => !l.desbloqueado) ?? [];
	const porcentaje = data?.total
		? Math.round((data.ganados * 100) / data.total)
		: 0;

	return (
		<div className="app-container space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1>Mis logros</h1>
					<p className="text-muted-foreground">
						Se desbloquean solos cuando cumples la condición.
					</p>
				</div>
				{data && data.total > 0 && (
					<div className="w-full max-w-xs space-y-1.5">
						<p className="text-right text-sm">
							<span className="font-semibold">{data.ganados}</span>
							<span className="text-muted-foreground">
								{" "}
								de {data.total} ganados
							</span>
						</p>
						<div className="h-2 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-violet-500"
								style={{ width: `${porcentaje}%` }}
							/>
						</div>
					</div>
				)}
			</div>

			{isLoading && <LoadingState message="Cargando tus logros..." />}
			{error && !data && (
				<EmptyState
					title="No se pudieron cargar tus logros"
					description={error.message}
				/>
			)}
			{data && data.total === 0 && (
				<EmptyState
					title="Tu organización todavía no tiene logros"
					description="Cuando los creen, aparecerán acá."
				/>
			)}

			{ganados.length > 0 && (
				<section className="space-y-3">
					<h2 className="font-semibold text-lg">Ganados</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{ganados.map((l) => (
							<Insignia key={l.id} logro={l} />
						))}
					</div>
				</section>
			)}

			{faltan.length > 0 && (
				<section className="space-y-3">
					<h2 className="font-semibold text-lg">Por ganar</h2>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{faltan.map((l) => (
							<Insignia key={l.id} logro={l} />
						))}
					</div>
				</section>
			)}
		</div>
	);
}

function Insignia({ logro: l }: { logro: MiLogro }) {
	const esRanking = l.condicion.tipo === "posicion_ranking";
	return (
		<Card className={l.desbloqueado ? "border-violet-500/30" : ""}>
			<CardContent className="flex flex-col items-center gap-2 p-5 text-center">
				<span
					className={`relative flex size-16 items-center justify-center rounded-full text-3xl ${
						l.desbloqueado
							? `bg-gradient-to-br from-violet-500/25 to-amber-400/25 ring-2 ${l.nuevo ? "ring-amber-400" : "ring-violet-500/40"}`
							: "bg-muted opacity-60 grayscale"
					}`}
				>
					{l.icono}
					{!l.desbloqueado && (
						<Lock className="-bottom-1 -right-1 absolute size-5 rounded-full bg-background p-0.5 text-muted-foreground" />
					)}
				</span>
				<p className="font-semibold">{l.nombre}</p>
				<p className="text-muted-foreground text-sm">
					{l.condicion.descripcion ?? l.descripcion}
				</p>

				{l.desbloqueado ? (
					<p className="text-violet-600 text-xs dark:text-violet-300">
						{l.nuevo ? "¡Recién ganado! · " : ""}
						{fecha(l.desbloqueadoAt)}
						{l.xpRecompensa > 0 ? ` · +${l.xpRecompensa} XP` : ""}
					</p>
				) : esRanking ? (
					<p className="text-muted-foreground text-xs">
						{l.progreso.actual
							? `Hoy vas en el puesto ${l.progreso.actual}`
							: "Todavía no estás en el ranking"}
					</p>
				) : (
					<div className="w-full space-y-1">
						<div className="h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-violet-500"
								style={{ width: `${Math.max(l.progreso.porcentaje, 3)}%` }}
							/>
						</div>
						<p className="text-muted-foreground text-xs tabular-nums">
							{l.progreso.actual ?? 0} de {l.progreso.meta}
							{l.xpRecompensa > 0 ? ` · +${l.xpRecompensa} XP` : ""}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
