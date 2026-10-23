import { Flame, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { MyProgress } from "#/lib/services/gamification";

/**
 * La racha de días activos del aprendiz.
 *
 * Cuenta días seguidos en los que hizo algo que dio puntos (completar un
 * recurso, que le aprueben una entrega, aprobar un examen), no veces que entró.
 * Tiene tres estados y cada uno pide algo distinto:
 *
 *   - activa y ya sumó hoy  -> felicitar
 *   - activa pero hoy nada  -> avisar que se corta si no hace algo
 *   - en cero               -> invitar a empezar, y recordar su mejor marca
 */
export function StreakCard({ racha }: { racha: MyProgress["racha"] }) {
	const { dias, maxima, activaHoy } = racha;
	const enRiesgo = dias > 0 && !activaHoy;

	let mensaje: string;
	if (dias === 0) {
		mensaje =
			maxima > 0
				? "Tu racha se cortó. Completa una actividad hoy para empezar una nueva."
				: "Completa una actividad hoy para empezar tu racha.";
	} else if (enRiesgo) {
		mensaje =
			"Todavía no sumaste el día de hoy. Completa una actividad para no perderla.";
	} else {
		mensaje = "Ya sumaste el día de hoy. ¡Vuelve mañana para seguir!";
	}

	return (
		<Card className={enRiesgo ? "border-amber-500/50" : undefined}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<Flame className="size-4" />
					Racha
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center gap-3">
					<Flame
						aria-hidden
						className={`size-10 shrink-0 ${
							dias > 0 && activaHoy
								? "fill-orange-500 text-orange-500"
								: enRiesgo
									? "text-amber-500"
									: "text-muted-foreground"
						}`}
					/>
					<p>
						<span className="font-semibold text-3xl tabular-nums">{dias}</span>{" "}
						<span className="text-muted-foreground">
							{dias === 1 ? "día seguido" : "días seguidos"}
						</span>
					</p>
				</div>

				<p
					className={`text-sm ${enRiesgo ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}`}
					role={enRiesgo ? "status" : undefined}
				>
					{mensaje}
				</p>

				{maxima > 0 && (
					<p className="flex items-center gap-1.5 text-muted-foreground text-xs">
						<Trophy className="size-3.5" />
						Tu mejor racha: {maxima} {maxima === 1 ? "día" : "días"}
					</p>
				)}
			</CardContent>
		</Card>
	);
}
