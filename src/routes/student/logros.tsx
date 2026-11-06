import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Gamepad2, Lock, Sparkles, Star, Trophy } from "lucide-react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Card, CardContent } from "#/components/ui/card";
import { useMyAchievements } from "#/hooks/achievements/use-my-achievements";
import { useMisJuegos } from "#/hooks/exams/use-mis-juegos";
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
					{data && data.nuevos > 0 && (
						<p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 px-3 py-1 font-medium text-amber-700 text-sm dark:text-amber-300">
							<Sparkles className="size-4" />
							{data.nuevos === 1
								? "Ganaste 1 logro nuevo"
								: `Ganaste ${data.nuevos} logros nuevos`}{" "}
							en las últimas 24 horas
						</p>
					)}
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

			<MisJuegos />
		</div>
	);
}

/**
 * El historial de juegos: cada concurso jugado con su mejor marca, cuántas
 * partidas lleva y el XP que le dio (solo la primera vez que lo ganó).
 * Si todavía no jugó ninguno, no se muestra.
 */
function MisJuegos() {
	const { data } = useMisJuegos();
	if (!data || data.juegos === 0) return null;

	return (
		<section className="space-y-3">
			<div className="flex flex-wrap items-end justify-between gap-2">
				<h2 className="flex items-center gap-2 font-semibold text-lg">
					<Gamepad2 className="size-5" />
					Mis juegos
				</h2>
				<p className="text-muted-foreground text-sm">
					{data.juegosAprobados} de {data.juegos} ganados · {data.xpGanado} XP
				</p>
			</div>
			<Card>
				<CardContent className="p-2">
					<ul>
						{data.historial.map((j) => (
							<li key={j.actividadId}>
								<Link
									to="/student/exam/$activityId"
									params={{ activityId: j.actividadId }}
									search={{ courseId: undefined }}
									className="flex flex-wrap items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
								>
									<span
										className={`flex size-9 shrink-0 items-center justify-center rounded-full ${j.aprobado ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}`}
									>
										{j.aprobado ? <Trophy className="size-4" /> : <Gamepad2 className="size-4" />}
									</span>
									<div className="min-w-0 flex-1">
										<p className="truncate font-medium">{j.titulo}</p>
										<p className="text-muted-foreground text-xs">
											{j.partidas} {j.partidas === 1 ? "partida" : "partidas"}
											{j.ultimaPartidaAt ? ` · última ${fecha(j.ultimaPartidaAt)}` : ""}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold tabular-nums">
											{j.mejorPorcentaje ?? 0}%
										</p>
										<p className="text-muted-foreground text-xs">mejor marca</p>
									</div>
									<span className="flex w-24 items-center justify-end gap-1 text-sm tabular-nums">
										<Star className="size-3.5 fill-amber-400 text-amber-500" />
										{j.xpGanado}/{j.xpPosible} XP
									</span>
								</Link>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</section>
	);
}

function Insignia({ logro: l }: { logro: MiLogro }) {
	const esRanking = l.condicion.tipo === "posicion_ranking";
	return (
		<Card
			className={`relative ${l.nuevo ? "border-amber-400 shadow-md shadow-amber-400/20" : l.desbloqueado ? "border-violet-500/30" : ""}`}
		>
			{l.nuevo && (
				<span className="absolute top-3 right-3 rounded-full bg-amber-400 px-2 py-0.5 font-semibold text-[11px] text-amber-950 shadow-sm">
					¡Nuevo!
				</span>
			)}
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
