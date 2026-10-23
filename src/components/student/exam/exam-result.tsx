import { CircleCheck, CircleX, RotateCcw, Star } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { Exam, ExamResult as Result } from "#/lib/services/exams";

/**
 * El resultado de un intento, recién corregido.
 *
 * La opción correcta de cada pregunta solo la manda el backend si aprobó o si
 * ya no le quedan intentos: mostrarla antes sería regalar el próximo intento.
 * Mientras tanto se ve qué acertó y qué no, sin la solución.
 */
export function ExamResultView({
	examen,
	resultado,
	onReintentar,
	acciones,
}: {
	examen: Exam;
	resultado: Result;
	onReintentar?: () => void;
	acciones: React.ReactNode;
}) {
	const { aprobado, porcentaje, porcentajeAprobacion, puntaje, puntajeTotal } =
		resultado;
	const porPregunta = new Map(resultado.detalle.map((d) => [d.preguntaId, d]));

	return (
		<div className="space-y-4">
			<Card
				className={aprobado ? "border-primary/50" : "border-destructive/40"}
			>
				<CardContent className="flex flex-col items-center gap-2 py-6 text-center">
					{aprobado ? (
						<CircleCheck className="size-12 text-primary" />
					) : (
						<CircleX className="size-12 text-destructive" />
					)}
					<p className="font-semibold text-xl">
						{aprobado ? "¡Aprobaste!" : "No aprobaste esta vez"}
					</p>
					<p className="font-semibold text-4xl tabular-nums">{porcentaje}%</p>
					<p className="text-muted-foreground text-sm">
						{puntaje} de {puntajeTotal} puntos · se necesitaba{" "}
						{porcentajeAprobacion}%
					</p>

					{aprobado && resultado.xpAcreditado > 0 && (
						<p className="flex items-center gap-1.5 font-medium text-sm">
							<Star className="size-4" />+{resultado.xpAcreditado} XP
							{resultado.subioDeNivel &&
								resultado.nivel != null &&
								` · ¡Subiste al nivel ${resultado.nivel}!`}
						</p>
					)}
					{resultado.xpPendiente && (
						<p className="text-muted-foreground text-xs">
							Tu XP se acreditará en unos momentos.
						</p>
					)}
					{resultado.logrosDesbloqueados.length > 0 && (
						<div className="mt-2 flex flex-wrap justify-center gap-2">
							{resultado.logrosDesbloqueados.map((l) => (
								<span
									key={l.id}
									className="rounded-full border px-3 py-1 text-sm"
								>
									{l.icono} {l.nombre}
								</span>
							))}
						</div>
					)}
					{!aprobado && (
						<p className="text-muted-foreground text-sm">
							{resultado.intentosRestantes > 0
								? `Te ${resultado.intentosRestantes === 1 ? "queda 1 intento" : `quedan ${resultado.intentosRestantes} intentos`}.`
								: "Ya no te quedan intentos."}
						</p>
					)}

					<div className="mt-3 flex flex-wrap justify-center gap-2">
						{!aprobado && resultado.intentosRestantes > 0 && onReintentar && (
							<Button onClick={onReintentar}>
								<RotateCcw />
								Intentar de nuevo
							</Button>
						)}
						{acciones}
					</div>
				</CardContent>
			</Card>

			{examen.preguntas.map((p, i) => {
				const d = porPregunta.get(p.id);
				return (
					<Card key={p.id}>
						<CardHeader>
							<CardTitle className="flex items-start gap-2 font-medium text-base">
								{d?.correcta ? (
									<CircleCheck
										aria-label="Correcta"
										className="mt-0.5 size-5 shrink-0 text-primary"
									/>
								) : (
									<CircleX
										aria-label="Incorrecta"
										className="mt-0.5 size-5 shrink-0 text-destructive"
									/>
								)}
								<span>
									{i + 1}. {p.enunciado}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2">
								{p.opciones.map((o) => {
									const elegida = d?.opcionId === o.id;
									const esCorrecta = d?.opcionCorrecta === o.id;
									let estilo = "";
									if (esCorrecta) estilo = "border-primary bg-primary/5";
									else if (elegida && !d?.correcta)
										estilo = "border-destructive bg-destructive/5";
									else if (elegida) estilo = "border-primary bg-primary/5";
									return (
										<li
											key={o.id}
											className={`flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm ${estilo}`}
										>
											<span>{o.texto}</span>
											<span className="shrink-0 text-muted-foreground text-xs">
												{elegida && "Tu respuesta"}
												{elegida && esCorrecta && " · "}
												{esCorrecta && "Correcta"}
											</span>
										</li>
									);
								})}
							</ul>
							{!d?.opcionId && (
								<p className="mt-2 text-muted-foreground text-xs">
									La dejaste sin responder.
								</p>
							)}
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}
