import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ArrowLeft,
	CircleCheck,
	Clock,
	ListChecks,
	LoaderCircle,
	Play,
	RefreshCw,
	Repeat,
	Star,
	Target,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { celebrar } from "#/components/shared/celebracion";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { ExamResultView } from "#/components/student/exam/exam-result";
import { ExamTaking } from "#/components/student/exam/exam-taking";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	useExam,
	useMyAttempts,
	useStartExam,
	useSubmitExam,
} from "#/hooks/exams/use-exam";
import type { ExamResult, StartedAttempt } from "#/lib/services/exams";

export const Route = createFileRoute("/student/exam/$activityId")({
	// De qué curso viene, para poder volver a él. Es opcional: sin él se vuelve
	// a "Mis cursos".
	validateSearch: (search: Record<string, unknown>) => ({
		courseId: typeof search.courseId === "string" ? search.courseId : undefined,
	}),
	component: ExamRoute,
});

/**
 * Rendir un examen, en tres pasos: ver de qué se trata, responderlo y ver el
 * resultado. Todo lo corrige el backend; acá no se sabe cuál es la respuesta
 * correcta hasta que él la manda.
 */
function ExamRoute() {
	const { activityId } = Route.useParams();
	const { courseId } = Route.useSearch();
	const examen = useExam(activityId);
	const intentos = useMyAttempts(activityId);
	const iniciar = useStartExam(activityId);
	const responder = useSubmitExam(activityId);

	const [enCurso, setEnCurso] = useState<StartedAttempt | null>(null);
	const [resultado, setResultado] = useState<ExamResult | null>(null);
	// Cada partida de un concurso sortea otras preguntas: el resultado se
	// muestra sobre las que salieron, no sobre el banco completo.
	const [ultimaPartida, setUltimaPartida] = useState<
		StartedAttempt["examen"] | null
	>(null);
	const esConcurso = examen.data?.tipo === "Concurso";

	const volver = (
		<Button asChild variant="outline">
			{courseId ? (
				<Link to="/student/courses/$courseId" params={{ courseId }}>
					<ArrowLeft />
					Volver al curso
				</Link>
			) : (
				<Link to="/student/courses">
					<ArrowLeft />
					Mis cursos
				</Link>
			)}
		</Button>
	);

	function empezar() {
		setResultado(null);
		iniciar.mutate(undefined, {
			onSuccess: (r) => {
				setEnCurso(r);
				setUltimaPartida(r.examen);
			},
			onError: (e: Error) =>
				toast.error(
					esConcurso
						? "No se pudo empezar la partida"
						: "No se pudo empezar el examen",
					{ description: e.message },
				),
		});
	}

	function enviar(
		respuestas: { preguntaId: string; opcionId: string | null }[],
	) {
		responder.mutate(respuestas, {
			onSuccess: (r) => {
				setResultado(r);
				setEnCurso(null);
				celebrar(r);
				window.scrollTo({ top: 0, behavior: "smooth" });
			},
			onError: (e: Error) => {
				toast.error("No se pudo enviar el examen", { description: e.message });
				// Si el intento ya se cerró (se acabó el tiempo, ya se había
				// enviado), volver a la portada muestra el estado real.
				if (/tiempo|enviado|intento abierto/i.test(e.message)) setEnCurso(null);
			},
		});
	}

	if (examen.isLoading || intentos.isLoading) {
		return (
			<Pagina volver={volver}>
				<LoadingState message="Cargando el examen..." />
			</Pagina>
		);
	}

	if (!examen.data) {
		return (
			<Pagina volver={volver}>
				<ErrorState
					title="No se pudo abrir la actividad"
					description={examen.error?.message}
					content={
						<Button onClick={() => examen.refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			</Pagina>
		);
	}

	const ex = examen.data;

	if (resultado) {
		return (
			<Pagina titulo={ex.titulo} volver={volver}>
				<ExamResultView
					examen={{ ...(ultimaPartida ?? ex), tipo: ex.tipo }}
					resultado={resultado}
					onReintentar={empezar}
					acciones={volver}
				/>
			</Pagina>
		);
	}

	if (enCurso) {
		return (
			<Pagina titulo={ex.titulo}>
				<ExamTaking
					examen={enCurso.examen}
					intento={enCurso.intento}
					enviando={responder.isPending}
					onEnviar={enviar}
				/>
			</Pagina>
		);
	}

	// Portada: de qué se trata y si todavía puede rendirlo.
	const mis = intentos.data;
	const abierto = mis?.intentos.find((i) => i.estado === "en_curso");
	const sinPreguntas = ex.preguntas.length === 0;
	// Un concurso se juega las veces que se quiera, aunque ya se haya ganado.
	const puedeRendir =
		!sinPreguntas &&
		(esConcurso ||
			(!mis?.aprobado && ((mis?.intentosRestantes ?? 1) > 0 || !!abierto)));

	return (
		<Pagina titulo={ex.titulo} volver={volver}>
			<Card>
				<CardHeader>
					<CardTitle className="text-base">
						{esConcurso ? "Cómo se juega" : "Antes de empezar"}
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<ul className="grid gap-3 text-sm sm:grid-cols-2">
						<Dato icono={<ListChecks className="size-4" />}>
							{ex.preguntas.length}{" "}
							{ex.preguntas.length === 1 ? "pregunta" : "preguntas"} ·{" "}
							{ex.puntajeTotal} puntos
						</Dato>
						<Dato icono={<Clock className="size-4" />}>
							{ex.tiempoLimite
								? `${ex.tiempoLimite} minutos`
								: "Sin límite de tiempo"}
						</Dato>
						<Dato icono={<Target className="size-4" />}>
							Apruebas con {ex.porcentajeAprobacion}%
						</Dato>
						<Dato icono={<Repeat className="size-4" />}>
							{esConcurso || !mis || mis.intentosPermitidos == null
								? `Partidas sin límite${mis?.intentosUsados ? ` · llevas ${mis.intentosUsados}` : ""}`
								: `${mis.intentosRestantes} de ${mis.intentosPermitidos} ${mis.intentosPermitidos === 1 ? "intento disponible" : "intentos disponibles"}`}
						</Dato>
						<Dato icono={<Star className="size-4" />}>
							{esConcurso
								? `Hasta ${ex.xp} XP según tu resultado, solo la primera vez que ganas`
								: `Hasta ${ex.xp} XP según tu nota`}
						</Dato>
					</ul>

					{ex.tiempoLimite && puedeRendir && !abierto && (
						<p className="text-muted-foreground text-sm">
							El tiempo empieza a correr cuando presionas "Comenzar" y sigue
							corriendo aunque cierres la página. Si se acaba, se envía lo que
							hayas respondido.
						</p>
					)}

					{mis?.aprobado && (
						<p className="flex items-center gap-2 font-medium text-sm">
							<CircleCheck className="size-4 text-primary" />
							{esConcurso
								? `Ya ganaste este concurso. Tu mejor marca: ${mis.mejorPorcentaje ?? 0}%. Puedes seguir jugando, pero ya no suma XP.`
								: `Ya aprobaste este examen${mis.mejorPorcentaje != null ? ` con ${mis.mejorPorcentaje}%` : ""}.`}
						</p>
					)}
					{!mis?.aprobado && mis && mis.mejorPorcentaje != null && (
						<p className="text-muted-foreground text-sm">
							Tu mejor resultado hasta ahora: {mis.mejorPorcentaje}%.
						</p>
					)}
					{sinPreguntas && (
						<p className="text-muted-foreground text-sm">
							Este examen todavía no tiene preguntas. Vuelve cuando el
							instructor lo termine de armar.
						</p>
					)}
					{!sinPreguntas &&
						!mis?.aprobado &&
						mis?.intentosRestantes === 0 &&
						!abierto && (
							<p className="text-muted-foreground text-sm">
								Ya usaste todos tus intentos.
							</p>
						)}

					{puedeRendir && (
						<Button onClick={empezar} disabled={iniciar.isPending}>
							{iniciar.isPending ? (
								<LoaderCircle className="animate-spin" />
							) : (
								<Play />
							)}
							{abierto
								? esConcurso
									? "Continuar la partida"
									: "Continuar el intento"
								: esConcurso
									? mis?.intentosUsados
										? "Jugar otra vez"
										: "Jugar"
									: "Comenzar"}
						</Button>
					)}
				</CardContent>
			</Card>
		</Pagina>
	);
}

function Pagina({
	titulo,
	volver,
	children,
}: {
	titulo?: string;
	volver?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<div className="app-container max-w-3xl space-y-6">
			{volver && <div className="-ml-2">{volver}</div>}
			{titulo && <h1>{titulo}</h1>}
			{children}
		</div>
	);
}

function Dato({
	icono,
	children,
}: {
	icono: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<li className="flex items-center gap-2">
			<span className="text-muted-foreground">{icono}</span>
			{children}
		</li>
	);
}
