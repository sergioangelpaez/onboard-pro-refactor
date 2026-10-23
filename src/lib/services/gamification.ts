import { apiFetch } from "./api-fetch";

export interface RankingEntry {
	id: string;
	firstname: string;
	lastname: string;
	level: number;
	xp: number;
	posicion: number;
}

/** Lo que devuelve `GET /gamification/me`: el progreso de quien inició sesión. */
export interface MyProgress {
	xp: number;
	nivel: number;
	/** XP con el que se entró al nivel actual. */
	xpNivelActual: number;
	/** XP que hace falta para el siguiente nivel; null en el nivel máximo. */
	xpSiguienteNivel: number | null;
	/** Avance dentro del nivel actual, de 0 a 100. */
	porcentaje: number;
	/** XP que falta para subir de nivel. */
	faltan: number;
	actividadesCompletadas: number;
	racha: {
		/** Días seguidos con actividad. Ya viene en 0 si la racha se cortó. */
		dias: number;
		/** La racha más larga que tuvo alguna vez. */
		maxima: number;
		/** Si hoy ya hizo algo que cuenta. Si no, la racha está en riesgo. */
		activaHoy: boolean;
	};
}

/** Una actividad que al aprendiz todavía le falta hacer. */
export interface PendingActivity {
	id: string;
	titulo: string;
	descripcion: string | null;
	tipo: "Recurso" | "Tarea" | "Examen";
	xp: number;
	esEntregable: boolean;
	curso: string;
	courseId: string;
	seccion: string;
}

/** Lo que devuelve `GET /gamification/pendientes` para un aprendiz. */
export interface StudentPending {
	rol: "student";
	resumen: {
		cursos: number;
		actividadesPendientes: number;
		xpPorGanar: number;
	};
	/** Las primeras 20, en el orden en que el curso las presenta. */
	actividadesPendientes: PendingActivity[];
}

export const gamificationService = {
	/**
	 * Lo que me falta hacer, solo de mis cursos publicados.
	 *
	 * No usar `/activities/get/all` para esto: devuelve todas las actividades
	 * de la empresa, sin filtrar por los cursos de la persona ni por lo que ya
	 * completó.
	 */
	async pending() {
		return await apiFetch<StudentPending>("/gamification/pendientes");
	},

	/**
	 * Mi XP, mi nivel y mi racha.
	 *
	 * Se pide acá y no se lee de `/auth/me`: el usuario guarda la racha tal como
	 * quedó la última vez que tuvo actividad, así que si pasaron días sin hacer
	 * nada seguiría mostrando una racha que ya se cortó. Este endpoint la
	 * recalcula al leerla.
	 */
	async myProgress() {
		return await apiFetch<MyProgress>("/gamification/me");
	},

	/**
	 * Los aprendices con mas XP dentro de un curso.
	 *
	 * Es distinto del ranking general: solo cuenta el XP que salio de las
	 * actividades de ese curso.
	 */
	async courseRanking(courseId: string, limite = 3) {
		return await apiFetch<RankingEntry[]>(
			`/gamification/courses/${courseId}/ranking?limite=${limite}`,
		);
	},
};
