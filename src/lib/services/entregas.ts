import type { Entrega } from "../schemas/entregas";
import { apiFetch } from "./api-fetch";
import { ApiError } from "./errors";

/** Lo que devuelve `GET /activities/:id/mi-entrega`. */
export type MiEntrega = Omit<Entrega, "aprendiz" | "estado"> & {
	id: string;
	estado: "entregado" | "aprobada" | "rehacer";
};

export const entregasService = {
	/**
	 * Mi entrega de una actividad, o null si todavía no entregué.
	 *
	 * El backend responde 404 cuando no hay entrega; acá eso no es un error,
	 * es simplemente "todavía no".
	 */
	async mine(activityId: string) {
		try {
			return await apiFetch<MiEntrega>(`/activities/${activityId}/mi-entrega`);
		} catch (error) {
			if (error instanceof ApiError && error.status === 404) return null;
			throw error;
		}
	},

	/**
	 * Sube o reemplaza mi entrega. Hay una sola por persona y actividad: volver
	 * a enviar reemplaza la anterior, salvo que ya esté aprobada.
	 */
	async submit(activityId: string, archivo: File | null, comentario: string) {
		const body = new FormData();
		if (archivo) body.append("archivo", archivo);
		if (comentario.trim()) body.append("comentario", comentario.trim());
		return await apiFetch<{ message: string; entrega: MiEntrega }>(
			`/activities/${activityId}/entrega`,
			{ method: "POST", body },
		);
	},

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
		return await apiFetch<{
			message: string;
			estado: string;
			xpAcreditado?: number;
		}>(`/entregas/${entregaId}/revisar`, {
			method: "PUT",
			body: JSON.stringify({ aprobada, feedback }),
		});
	},

	/** URL temporal del archivo entregado. Vence en una hora. */
	async archivo(entregaId: string) {
		return await apiFetch<{ url: string }>(`/entregas/${entregaId}/archivo`);
	},
};
