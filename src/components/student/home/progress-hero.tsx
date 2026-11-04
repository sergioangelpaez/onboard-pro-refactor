import { Flame, Star } from "lucide-react";
import type { MyProgress } from "#/lib/services/gamification";

/**
 * La cabecera del inicio: saludo, nivel con su barra y la racha.
 *
 * Es la "tarjeta de jugador": lo primero que se ve tiene que decir cómo vas y
 * qué te falta para el próximo escalón. El color sale del tema (primary), así
 * funciona igual en claro y en oscuro.
 */
export function ProgressHero({
	nombre,
	progreso,
	pendientes,
}: {
	nombre?: string;
	progreso?: MyProgress;
	pendientes?: number;
}) {
	const racha = progreso?.racha;
	const enRiesgo = !!racha && racha.dias > 0 && !racha.activaHoy;

	let subtitulo = "Así va tu progreso.";
	if (pendientes === 0)
		subtitulo = "¡Estás al día! No te queda nada pendiente.";
	else if (pendientes) {
		subtitulo = `Te ${pendientes === 1 ? "queda 1 actividad" : `quedan ${pendientes} actividades`} para estar al día.`;
	}

	return (
		<section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/20 via-primary/5 to-background p-6 md:p-8">
			{/* Decoración: dos manchas de color difuminadas. No llevan contenido. */}
			<div
				aria-hidden
				className="-right-16 -top-16 absolute size-56 rounded-full bg-primary/20 blur-3xl"
			/>
			<div
				aria-hidden
				className="-bottom-24 absolute right-1/3 size-48 rounded-full bg-orange-400/15 blur-3xl"
			/>

			<div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
				<div className="space-y-2">
					<h1 className="font-semibold text-3xl tracking-tight md:text-4xl">
						{nombre ? `¡Hola, ${nombre}!` : "¡Hola!"}
					</h1>
					<p className="text-muted-foreground">{subtitulo}</p>

					{racha && (
						<span
							className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium text-sm ${
								enRiesgo
									? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
									: racha.dias > 0
										? "bg-orange-500/15 text-orange-700 dark:text-orange-300"
										: "bg-muted text-muted-foreground"
							}`}
						>
							<Flame
								className={`size-4 ${racha.dias > 0 && racha.activaHoy ? "fill-current" : ""}`}
							/>
							{racha.dias > 0
								? `${racha.dias} ${racha.dias === 1 ? "día" : "días"} de racha${enRiesgo ? " · ¡no la pierdas hoy!" : ""}`
								: "Empieza tu racha hoy"}
						</span>
					)}
				</div>

				{progreso && (
					<div className="w-full space-y-2 md:max-w-sm">
						<div className="flex items-end justify-between gap-3">
							<p className="flex items-center gap-2">
								<span className="flex size-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-300">
									<Star className="size-5 fill-current" />
								</span>
								<span>
									<span className="block text-muted-foreground text-xs">
										Nivel
									</span>
									<span className="font-semibold text-2xl tabular-nums leading-none">
										{progreso.nivel}
									</span>
									{progreso.nombreNivel && (
										<span className="ml-1.5 font-medium text-muted-foreground text-sm">
											{progreso.nombreNivel}
										</span>
									)}
								</span>
							</p>
							{/* Lo mismo que mide la barra: el avance dentro del nivel, no
							    el total, que hacía parecer la barra más corta de lo que
							    decía el número. */}
							<p className="text-right text-sm">
								{progreso.xpSiguienteNivel ? (
									<>
										<span className="font-semibold tabular-nums">
											{Math.max(progreso.xp - progreso.xpNivelActual, 0)}
										</span>
										<span className="text-muted-foreground">
											{" / "}
											{progreso.xpSiguienteNivel - progreso.xpNivelActual} XP
											de este nivel
										</span>
									</>
								) : (
									<span className="font-semibold tabular-nums">
										{progreso.xp} XP
									</span>
								)}
							</p>
						</div>
						<div
							role="progressbar"
							aria-label="Avance hacia el siguiente nivel"
							aria-valuemin={0}
							aria-valuemax={100}
							aria-valuenow={progreso.porcentaje}
							className="h-3 overflow-hidden rounded-full bg-background/70 ring-1 ring-border"
						>
							<div
								className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all"
								style={{ width: `${Math.max(progreso.porcentaje, 2)}%` }}
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							{progreso.xpSiguienteNivel === null
								? "Llegaste al nivel máximo."
								: `${progreso.xp} XP en total · te faltan ${progreso.faltan} para el nivel ${progreso.nivel + 1}${progreso.nombreSiguiente ? ` · ${progreso.nombreSiguiente}` : ""}.`}
						</p>
					</div>
				)}
			</div>
		</section>
	);
}
