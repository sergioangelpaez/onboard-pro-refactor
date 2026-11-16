import { Link } from "@tanstack/react-router";
import {
	ChevronRight,
	History,
	ListChecks,
	Medal,
	RefreshCw,
} from "lucide-react";
import { ErrorState } from "#/components/shared/states/error-state";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { useMisMovimientos } from "#/hooks/gamification/use-mis-movimientos";
import { useMyProgress } from "#/hooks/gamification/use-my-progress";
import type { MovimientoXp } from "#/lib/services/gamification";
import { fechaHora, haceCuanto } from "#/lib/utils/fechas";

/**
 * De dónde salió mi XP (HU-056): las últimas acreditaciones, cada una con su
 * origen, junto al nivel en el que estoy y cuánto me falta para el siguiente.
 *
 * El número de XP solo, sin historia, no le dice al aprendiz qué hizo bien ni
 * qué le conviene repetir. `visibles` recorta la lista para el inicio; el
 * perfil la muestra entera. `conNivel` en false oculta la barra de nivel
 * donde ya se ve en otro lado (la cabecera del inicio).
 */
export function UltimasAcreditaciones({
	visibles,
	conNivel = true,
	className,
}: {
	visibles?: number;
	conNivel?: boolean;
	className?: string;
}) {
	const movimientos = useMisMovimientos();
	const { data: progreso } = useMyProgress();
	const lista = visibles
		? movimientos.data?.slice(0, visibles)
		: movimientos.data;
	const hayMas = !!visibles && (movimientos.data?.length ?? 0) > visibles;

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<History className="size-4" />
					Últimas acreditaciones
				</CardTitle>
				<CardDescription>El XP que ganaste y de dónde salió.</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{conNivel && progreso && (
					<div className="space-y-1.5 rounded-lg border bg-muted/40 p-3">
						<div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
							<p>
								Nivel <span className="font-semibold">{progreso.nivel}</span>
								{progreso.nombreNivel && (
									<span className="text-muted-foreground">
										{" "}
										· {progreso.nombreNivel}
									</span>
								)}
							</p>
							<p className="text-muted-foreground text-xs tabular-nums">
								{progreso.xpSiguienteNivel === null
									? "Nivel máximo alcanzado"
									: `Te faltan ${progreso.faltan} XP para el nivel ${progreso.nivel + 1}`}
							</p>
						</div>
						<div
							className="h-2 overflow-hidden rounded-full bg-muted"
							role="progressbar"
							aria-label="Avance hacia el siguiente nivel"
							aria-valuenow={progreso.porcentaje}
							aria-valuemin={0}
							aria-valuemax={100}
						>
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${progreso.porcentaje}%` }}
							/>
						</div>
					</div>
				)}

				{movimientos.isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-full" />
						<Skeleton className="h-10 w-4/5" />
					</div>
				)}

				{!movimientos.data && movimientos.error && (
					<ErrorState
						title="No se pudieron cargar tus acreditaciones"
						description={movimientos.error.message}
						content={
							<Button onClick={() => movimientos.refetch()}>
								<RefreshCw />
								Reintentar
							</Button>
						}
					/>
				)}

				{lista && lista.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Todavía no ganaste XP. Completa una actividad y aquí verás cuánto te
						dio.
					</p>
				)}

				{lista && lista.length > 0 && (
					<ul className="space-y-1">
						{lista.map((m) => (
							<Movimiento key={m.id} m={m} />
						))}
					</ul>
				)}

				{hayMas && (
					<Button
						variant="ghost"
						size="sm"
						className="w-full text-primary"
						asChild
					>
						<Link to="/student/profile">
							Ver todas
							<ChevronRight />
						</Link>
					</Button>
				)}
			</CardContent>
		</Card>
	);
}

function Movimiento({ m }: { m: MovimientoXp }) {
	const esLogro = m.origen.tipo === "logro";
	return (
		<li
			className="flex items-center gap-3 rounded-lg px-1 py-1.5"
			title={m.motivo}
		>
			<span
				className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
					esLogro
						? "bg-violet-500/15 text-violet-600 dark:text-violet-300"
						: "bg-primary/15 text-primary"
				}`}
			>
				{esLogro ? (
					<Medal className="size-4" />
				) : (
					<ListChecks className="size-4" />
				)}
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-sm">{m.origen.titulo}</p>
				<p className="truncate text-muted-foreground text-xs">
					{esLogro ? "Logro" : "Actividad"}
					{m.origen.curso && ` · ${m.origen.curso.nombre}`}
					{" · "}
					<time dateTime={m.fecha} title={fechaHora(m.fecha) ?? undefined}>
						{haceCuanto(m.fecha)}
					</time>
				</p>
			</div>
			<span
				className={`shrink-0 font-semibold text-sm tabular-nums ${
					m.xp >= 0
						? "text-emerald-600 dark:text-emerald-300"
						: "text-destructive"
				}`}
			>
				{m.xp >= 0 ? `+${m.xp}` : m.xp} XP
			</span>
		</li>
	);
}
