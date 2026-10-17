import type { Entrega } from "../schemas/entregas";
import { apiFetch } from "./api-fetch";

export const entregasService = {
	/** Todas las entregas de una actividad, con quien las hizo (HU-048). */
	async byActivity(activityId: string) {
		return await apiFetch<Entrega[]>(`/activities/${activityId}/entregas`);
	},

	/**
	 * Aprueba la entrega o pide que la rehagan.
	 *
	 * No hay nota: esto es onboarding. El comentario es obligatorio en los dos
	 * casos, porque un "aprobado" sin decir que estuvo bien ensena poco y un
	 * "rehacelo" sin decir que corregir no se puede cumplir.
	 */
	async revisar(entregaId: string, aprobada: boolean, feedback: string) {
		return await apiFetch<{ message: string; estado: string; xpAcreditado?: number }>(
			`/entregas/${entregaId}/revisar`,
			{ method: "PUT", body: JSON.stringify({ aprobada, feedback }) },
		);
	},

	/** URL temporal del archivo entregado. Vence en una hora. */
	async archivo(entregaId: string) {
		return await apiFetch<{ url: string }>(`/entregas/${entregaId}/archivo`);
	},
};
