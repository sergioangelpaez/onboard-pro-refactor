import { createFileRoute } from "@tanstack/react-router";
import { Crown, RefreshCw, Trophy } from "lucide-react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import { useRanking } from "#/hooks/gamification/use-ranking";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import type { RankingEntry } from "#/lib/services/gamification";

export const Route = createFileRoute("/student/ranking")({
	component: RankingRoute,
});

/** Oro, plata y bronce, con el alto de cada escalón del podio. */
const PODIO = [
	{
		color:
			"from-amber-400/30 to-amber-400/5 text-amber-600 dark:text-amber-300",
		alto: "h-28",
	},
	{
		color: "from-zinc-400/30 to-zinc-400/5 text-zinc-500 dark:text-zinc-300",
		alto: "h-20",
	},
	{
		color:
			"from-orange-700/25 to-orange-700/5 text-orange-700 dark:text-orange-400",
		alto: "h-14",
	},
];

function iniciales(p: RankingEntry) {
	return `${p.firstname?.[0] ?? ""}${p.lastname?.[0] ?? ""}`.toUpperCase();
}

/**
 * La tabla de posiciones de la organización. Solo aprendices y ordenada por XP:
 * el nivel empata mucho, el XP distingue quién va adelante.
 *
 * Arriba el podio, abajo la lista completa con la fila propia resaltada, para
 * encontrarse sin buscar.
 */
function RankingRoute() {
	const { user } = useCurrentUser();
	const { data, isLoading, error, refetch } = useRanking();
	const yo = data?.find((p) => p.id === user?.id);
	// En el podio el primero va al centro: 2 · 1 · 3.
	const podio = [data?.[1], data?.[0], data?.[2]];

	return (
		<div className="app-container space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1>Ranking</h1>
					<p className="text-muted-foreground">
						Quién lleva más XP en tu organización.
					</p>
				</div>
				{yo && (
					<p className="rounded-full bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
						Vas en el puesto {yo.posicion} de {data?.length}
					</p>
				)}
			</div>

			{isLoading && <LoadingState message="Cargando el ranking..." />}

			{!data && error && (
				<ErrorState
					title="No se pudo cargar el ranking"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{data && data.length === 0 && (
				<EmptyState
					title="Todavía no hay nadie en el ranking"
					description="Completa actividades para aparecer."
				/>
			)}

			{data && data.length > 0 && (
				<>
					<div className="grid grid-cols-3 items-end gap-3 md:mx-auto md:max-w-2xl">
						{podio.map((p, i) => {
							// Con menos de tres personas queda un escalón vacío: se
							// ocupa el lugar para que el podio no se desarme.
							if (!p) return <div key={["segundo", "primero", "tercero"][i]} />;
							const lugar = p.posicion - 1;
							const estilo = PODIO[lugar] ?? PODIO[2];
							return (
								<div
									key={p.id}
									className="flex flex-col items-center gap-2 text-center"
								>
									{lugar === 0 && (
										<Crown className="size-6 fill-amber-400 text-amber-500" />
									)}
									<span
										className={`flex size-14 items-center justify-center rounded-full bg-gradient-to-b font-semibold text-lg ring-2 ring-background ${estilo.color} ${p.id === user?.id ? "ring-primary" : ""}`}
									>
										{iniciales(p)}
									</span>
									<div className="min-w-0">
										<p className="truncate font-medium text-sm">
											{p.firstname} {p.lastname?.[0] ? `${p.lastname[0]}.` : ""}
										</p>
										<p className="text-muted-foreground text-xs tabular-nums">
											{p.xp} XP · Nivel {p.level}
										</p>
									</div>
									<div
										className={`flex w-full items-start justify-center rounded-t-xl bg-gradient-to-b pt-2 font-bold text-2xl ${estilo.alto} ${estilo.color}`}
									>
										{p.posicion}
									</div>
								</div>
							);
						})}
					</div>

					<Card>
						<CardContent className="p-2">
							<ol>
								{data.map((p) => {
									const soyYo = p.id === user?.id;
									return (
										<li
											key={p.id}
											className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${soyYo ? "bg-primary/10 font-medium" : ""}`}
										>
											<span className="w-8 text-center font-semibold text-muted-foreground tabular-nums">
												{p.posicion <= 3 ? (
													<Trophy
														className={`mx-auto size-4 ${["text-amber-500", "text-zinc-400", "text-orange-700"][p.posicion - 1]}`}
													/>
												) : (
													p.posicion
												)}
											</span>
											<span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs">
												{iniciales(p)}
											</span>
											<span className="min-w-0 flex-1 truncate">
												{p.firstname} {p.lastname}
												{soyYo && (
													<span className="ml-2 text-primary text-xs">
														(tú)
													</span>
												)}
											</span>
											<span className="hidden text-muted-foreground text-xs sm:inline">
												Nivel {p.level}
											</span>
											<span className="w-20 text-right tabular-nums">
												{p.xp} XP
											</span>
										</li>
									);
								})}
							</ol>
						</CardContent>
					</Card>
				</>
			)}
		</div>
	);
}
