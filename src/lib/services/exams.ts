import { apiFetch } from "./api-fetch";

/** Una opción tal como la ve quien rinde: sin decir cuál es la correcta. */
export interface ExamOption {
	id: string;
	texto: string;
}

export interface ExamQuestion {
	id: string;
	enunciado: string;
	puntaje: number;
	orden: number;
	opciones: ExamOption[];
}

/** `GET /activities/:id/examen`. Para un aprendiz nunca trae las respuestas. */
export interface Exam {
	actividadId: string;
	/** "Examen" o "Concurso": el concurso usa el mismo motor, con partidas sin límite. */
	tipo?: "Examen" | "Concurso";
	titulo: string;
	xp: number;
	/** En minutos; null si no tiene límite. */
	tiempoLimite: number | null;
	/** null: sin límite (los concursos se juegan las veces que se quiera). */
	intentosPermitidos: number | null;
	porcentajeAprobacion: number;
	/** Si quien lo armó deja ver qué acertó cada uno al terminar. */
	mostrarRespuestas?: boolean;
	puntajeTotal: number;
	preguntas: ExamQuestion[];
}

export interface ExamAttempt {
	id: string;
	numero: number;
	estado: "en_curso" | "finalizado";
	iniciadoAt: string;
	/** Hasta cuándo se puede enviar; null si no hay tiempo límite. */
	venceAt: string | null;
	finalizadoAt: string | null;
	puntaje: number | null;
	puntajeTotal: number | null;
	porcentaje: number | null;
	aprobado: boolean | null;
}

/** `GET /activities/:id/examen/intentos`. */
export interface MyAttempts {
	tipo?: "Examen" | "Concurso";
	/** null en un concurso: partidas sin límite. */
	intentosPermitidos: number | null;
	intentosUsados: number;
	intentosRestantes: number | null;
	aprobado: boolean;
	mejorPorcentaje: number | null;
	porcentajeAprobacion: number;
	intentos: ExamAttempt[];
}

/** `POST /activities/:id/examen/iniciar`. */
export interface StartedAttempt {
	message: string;
	intento: ExamAttempt;
	intentosRestantes: number;
	examen: Exam;
}

export interface AnswerResult {
	preguntaId: string;
	opcionId: string | null;
	correcta: boolean;
	puntaje: number;
	/** Solo viene si aprobó o si ya no le quedan intentos. */
	opcionCorrecta?: string | null;
}

export interface UnlockedAchievement {
	id: string;
	nombre: string;
	icono: string;
	xpRecompensa: number;
}

/** `POST /activities/:id/examen/responder`. */
export interface ExamResult {
	message: string;
	aprobado: boolean;
	puntaje: number;
	puntajeTotal: number;
	porcentaje: number;
	porcentajeAprobacion: number;
	/** null en un concurso: se puede seguir jugando. */
	intentosRestantes: number | null;
	xpAcreditado: number;
	/** Lo que valía el intento. */
	xpBase?: number;
	/** Por qué sumó menos de lo esperado (reintento o ya cobrado). */
	avisoXp?: string | null;
	xpPendiente: boolean;
	nivel?: number;
	subioDeNivel: boolean;
	logrosDesbloqueados: UnlockedAchievement[];
	mostrarRespuestas?: boolean;
	/** null si quien lo armó no deja ver qué acertó cada uno. */
	detalle: AnswerResult[] | null;
}

/** Un juego en mi historial (`GET /concursos/mios`). */
export interface MiJuego {
	actividadId: string;
	titulo: string;
	partidas: number;
	mejorPorcentaje: number | null;
	aprobado: boolean;
	xpGanado: number;
	xpPosible: number;
	ultimaPartidaAt: string | null;
}

export interface MisJuegos {
	juegos: number;
	juegosAprobados: number;
	xpGanado: number;
	historial: MiJuego[];
}

/** Lo mismo que `Exam`, visto por quien lo arma: cada opción dice si es la correcta. */
export interface EditableExam extends Omit<Exam, "preguntas"> {
	preguntas: (Omit<ExamQuestion, "opciones"> & {
		opciones: (ExamOption & { esCorrecta: boolean })[];
	})[];
}

/** Lo que recibe `PUT /activities/:id/examen`. Lo que no se manda no se toca. */
export interface SaveExamPayload {
	tiempoLimite?: number | null;
	mostrarRespuestas?: boolean;
	intentosPermitidos?: number;
	porcentajeAprobacion?: number;
	/** La lista entera y en orden: con id se edita, sin id se crea, la que falta se borra. */
	preguntas?: {
		id?: string;
		enunciado: string;
		puntaje: number;
		opciones: { texto: string; esCorrecta: boolean }[];
	}[];
}

export const examsService = {
	/** El examen con las respuestas correctas, para el editor. */
	async getEditable(activityId: string) {
		return await apiFetch<EditableExam>(`/activities/${activityId}/examen`);
	},

	async save(activityId: string, payload: SaveExamPayload) {
		return await apiFetch<{ message: string; examen: EditableExam }>(
			`/activities/${activityId}/examen`,
			{ method: "PUT", body: JSON.stringify(payload) },
		);
	},

	/** Mi historial de juegos: mejor resultado y partidas de cada concurso. */
	async misJuegos() {
		return await apiFetch<MisJuegos>("/concursos/mios");
	},

	async get(activityId: string) {
		return await apiFetch<Exam>(`/activities/${activityId}/examen`);
	},

	async myAttempts(activityId: string) {
		return await apiFetch<MyAttempts>(
			`/activities/${activityId}/examen/intentos`,
		);
	},

	/**
	 * Abre un intento. El tiempo límite corre desde acá, no desde que se envía.
	 * Si ya había uno abierto y en tiempo, el backend devuelve ese mismo: no se
	 * gasta otro intento por recargar la página.
	 */
	async start(activityId: string) {
		return await apiFetch<StartedAttempt>(
			`/activities/${activityId}/examen/iniciar`,
			{
				method: "POST",
			},
		);
	},

	/** Una pregunta sin responder se manda igual, con `opcionId` null: cuenta como incorrecta. */
	async submit(
		activityId: string,
		respuestas: { preguntaId: string; opcionId: string | null }[],
	) {
		return await apiFetch<ExamResult>(
			`/activities/${activityId}/examen/responder`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ respuestas }),
			},
		);
	},
};
