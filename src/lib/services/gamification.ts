import { apiFetch } from "./api-fetch";

export interface RankingEntry {
	id: string;
	firstname: string;
	lastname: string;
	level: number;
	xp: number;
	posicion: number;
}

export const gamificationService = {
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
