import { Globe, Target } from "lucide-react";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { Logro } from "#/lib/services/logros";
import { AchievementActions } from "./achievement-actions";

/**
 * Un logro del catálogo.
 *
 * El alcance va a la vista porque cambia quién lo puede ganar: uno genérico
 * vale para todas las organizaciones (y solo lo edita el superadmin), uno de
 * curso solo cuenta lo hecho dentro de ese curso.
 */
export function AchievementCard({
	logro,
	curso,
	organizacion,
	editable = true,
}: {
	logro: Logro;
	curso?: string;
	/** Un logro genérico solo lo toca el superadmin. */
	editable?: boolean;
	/** Solo se pasa cuando hace falta distinguir organizaciones (superadmin). */
	organizacion?: string;
}) {
	let alcance = organizacion ?? "Toda la organización";
	if (logro.generico) alcance = "Todas las organizaciones";
	else if (logro.cursoId)
		alcance = `${organizacion ? `${organizacion} · ` : ""}${curso ? `Curso: ${curso}` : "De un curso"}`;

	return (
		<Card className={logro.activo ? "h-full" : "h-full opacity-60"}>
			<CardHeader className="flex flex-row items-start gap-3">
				<span
					aria-hidden
					className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-muted text-2xl"
				>
					{logro.icono}
				</span>
				<div className="min-w-0 flex-1 space-y-1">
					<CardTitle className="text-base">{logro.nombre}</CardTitle>
					<div className="flex flex-wrap gap-1.5">
						<Badge variant="secondary">{logro.categoria}</Badge>
						{logro.generico && (
							<Badge variant="outline">
								<Globe />
								Genérico
							</Badge>
						)}
						{!logro.activo && <Badge variant="outline">Inactivo</Badge>}
					</div>
				</div>
				{editable && <AchievementActions logro={logro} />}
			</CardHeader>

			<CardContent className="space-y-2 text-sm">
				{logro.descripcion && (
					<p className="text-muted-foreground">{logro.descripcion}</p>
				)}
				<p className="flex items-center gap-1.5">
					<Target className="size-4 shrink-0 text-muted-foreground" />
					{logro.condicion.descripcion ??
						`${logro.condicion.tipo}: ${logro.condicion.meta}`}
				</p>
				<div className="flex flex-wrap items-center justify-between gap-2 text-muted-foreground text-xs">
					<span>{alcance}</span>
					<span className="font-medium text-foreground">
						{logro.xpRecompensa > 0 ? `+${logro.xpRecompensa} XP` : "Sin XP"}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
