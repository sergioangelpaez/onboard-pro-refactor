import { Clock, LoaderCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import type { Exam, ExamAttempt } from "#/lib/services/exams";

type Respuestas = Record<string, string>;

function segundosHasta(venceAt: string | null) {
	if (!venceAt) return null;
	return Math.max(
		Math.floor((new Date(venceAt).getTime() - Date.now()) / 1000),
		0,
	);
}

/** Segundos que faltan hasta `venceAt`, actualizado cada segundo. Null si no hay límite. */
function useCuentaRegresiva(venceAt: string | null) {
	const [restantes, setRestantes] = useState(() => segundosHasta(venceAt));

	useEffect(() => {
		setRestantes(segundosHasta(venceAt));
		if (!venceAt) return;
		const id = setInterval(() => setRestantes(segundosHasta(venceAt)), 1000);
		return () => clearInterval(id);
	}, [venceAt]);

	return restantes;
}

function formato(segundos: number) {
	const m = Math.floor(segundos / 60);
	const s = segundos % 60;
	return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * El examen mientras se rinde.
 *
 * Las respuestas viven solo en la pantalla hasta enviar. Si se recarga, el
 * intento sigue abierto en el servidor y se puede retomar, pero las opciones
 * marcadas se pierden: el backend recibe las respuestas todas juntas al final.
 *
 * Cuando se acaba el tiempo se envía solo con lo que haya marcado: es mejor
 * que perder el intento entero en cero.
 */
export function ExamTaking({
	examen,
	intento,
	enviando,
	onEnviar,
}: {
	examen: Exam;
	intento: ExamAttempt;
	enviando: boolean;
	onEnviar: (
		respuestas: { preguntaId: string; opcionId: string | null }[],
	) => void;
}) {
	const [respuestas, setRespuestas] = useState<Respuestas>({});
	const restantes = useCuentaRegresiva(intento.venceAt);
	const enviado = useRef(false);

	const respondidas = examen.preguntas.filter((p) => respuestas[p.id]).length;
	const faltan = examen.preguntas.length - respondidas;

	function enviar() {
		if (enviado.current) return;
		enviado.current = true;
		onEnviar(
			examen.preguntas.map((p) => ({
				preguntaId: p.id,
				opcionId: respuestas[p.id] ?? null,
			})),
		);
	}

	// Si el envío falla (sin red, por ejemplo), se puede volver a intentar.
	useEffect(() => {
		if (!enviando) enviado.current = false;
	}, [enviando]);

	// Con un ref el efecto usa siempre las respuestas más recientes sin tener
	// que volver a dispararse cada vez que se marca una opción.
	const enviarRef = useRef(enviar);
	enviarRef.current = enviar;
	useEffect(() => {
		if (restantes === 0) enviarRef.current();
	}, [restantes]);

	const poco = restantes !== null && restantes <= 60;

	return (
		<div className="space-y-4">
			<div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background/95 px-4 py-3 backdrop-blur">
				<p className="text-sm">
					Intento {intento.numero} · {respondidas} de {examen.preguntas.length}{" "}
					respondidas
				</p>
				{restantes !== null && (
					<p
						className={`flex items-center gap-1.5 font-medium text-sm tabular-nums ${poco ? "text-destructive" : ""}`}
						aria-live={poco ? "polite" : "off"}
					>
						<Clock className="size-4" />
						{formato(restantes)}
					</p>
				)}
			</div>

			{examen.preguntas.map((p, i) => (
				<Card key={p.id}>
					<CardHeader>
						<CardTitle className="flex items-start justify-between gap-3 font-medium text-base">
							<span>
								{i + 1}. {p.enunciado}
							</span>
							<span className="shrink-0 font-normal text-muted-foreground text-xs">
								{p.puntaje} {p.puntaje === 1 ? "punto" : "puntos"}
							</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						<fieldset className="space-y-2">
							<legend className="sr-only">{p.enunciado}</legend>
							{p.opciones.map((o) => {
								const elegida = respuestas[p.id] === o.id;
								return (
									<label
										key={o.id}
										className={`flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-accent ${elegida ? "border-primary bg-primary/5" : ""}`}
									>
										<input
											type="radio"
											name={p.id}
											value={o.id}
											checked={elegida}
											onChange={() =>
												setRespuestas((r) => ({ ...r, [p.id]: o.id }))
											}
											className="accent-primary"
										/>
										{o.texto}
									</label>
								);
							})}
						</fieldset>
					</CardContent>
				</Card>
			))}

			<div className="flex flex-wrap items-center justify-end gap-3">
				{faltan > 0 && (
					<p className="text-muted-foreground text-sm">
						{faltan === 1
							? "Te falta 1 pregunta: si la dejas en blanco cuenta como incorrecta."
							: `Te faltan ${faltan} preguntas: si las dejas en blanco cuentan como incorrectas.`}
					</p>
				)}
				<Button onClick={enviar} disabled={enviando}>
					{enviando ? <LoaderCircle className="animate-spin" /> : <Send />}
					Enviar respuestas
				</Button>
			</div>
		</div>
	);
}
