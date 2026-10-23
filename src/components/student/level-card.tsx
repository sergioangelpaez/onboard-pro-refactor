import { Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { MyProgress } from "#/lib/services/gamification";

/**
 * Nivel y avance hacia el siguiente.
 *
 * Todos los números vienen calculados del backend (porcentaje, cuánto falta):
 * la curva de niveles vive allá, y si se calculara acá dos pantallas podrían
 * mostrar cifras distintas para la misma persona.
 */
export function LevelCard({ progreso }: { progreso: MyProgress }) {
	const { nivel, xp, porcentaje, faltan, xpSiguienteNivel } = progreso;
	const nivelMaximo = xpSiguienteNivel === null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<Star className="size-4" />
					Nivel
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<p>
					<span className="font-semibold text-3xl tabular-nums">{nivel}</span>{" "}
					<span className="text-muted-foreground">· {xp} XP</span>
				</p>

				<div
					role="progressbar"
					aria-label="Avance hacia el siguiente nivel"
					aria-valuemin={0}
					aria-valuemax={100}
					aria-valuenow={porcentaje}
					className="h-2 overflow-hidden rounded-full bg-muted"
				>
					<div
						className="h-full rounded-full bg-primary transition-all"
						style={{ width: `${porcentaje}%` }}
					/>
				</div>

				<p className="text-muted-foreground text-sm">
					{nivelMaximo
						? "Llegaste al nivel máximo."
						: `Te faltan ${faltan} XP para el nivel ${nivel + 1}.`}
				</p>
			</CardContent>
		</Card>
	);
}
