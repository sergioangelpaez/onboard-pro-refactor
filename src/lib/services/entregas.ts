import type { Entrega } from "../schemas/entregas";
import { apiFetch } from "./api-fetch";
import { ApiError } from "./errors";

/** Quién revisó una entrega. Solo el nombre: el aprendiz no necesita más. */
export interface Revisor {
	firstname: string;
	lastname: string;
}

/**
 * Lo que devuelve `GET /activities/:id/mi-entrega`.
 *
 * `revisadoPor`, `revisadoAt` y `xpObtenido` llegan en null mientras la
 * entrega espera revisión: no hay a quién nombrar ni XP que mostrar todavía.
 */
export type MiEntrega = Omit<Entrega, "aprendiz" | "estado" | "revisadoPor"> & {
	id: string;
	estado: "entregado" | "aprobada" | "rehacer";
	revisadoPor?: Revisor | null;
	xpObtenido?: number | null;
};

/** Una de mis entregas en `GET /entregas/mias`, con su actividad y su curso. */
export interface EntregaPropia {
	id: string;
	actividad: { id: string; titulo: string };
	curso: { id: string; nombre: string };
	estado: "entregado" | "aprobada" | "rehacer";
	entregadoAt: string | null;
	feedback: string | null;
	revisadoAt: string | null;
	revisadoPor: Revisor | null;
	xpObtenido: number | null;
}

export type EstadoBandeja = "entregado" | "rehacer" | "aprobada" | "todas";

/** Una entrega en la bandeja de quien corrige, con su actividad y su curso. */
export type EntregaDeBandeja = Omit<Entrega, "id" | "estado"> & {
	id: string;
	estado: "entregado" | "aprobada" | "rehacer";
	actividad: { id: string; titulo: string };
	curso: { id: string; nombre: string };
};

/** `GET /entregas`. */
export interface Bandeja {
	contadores: {
		porRevisar: number;
		rehacer: number;
		aprobadas: number;
		total: number;
	};
	entregas: EntregaDeBandeja[];
}

export const entregasService = {
	/**
	 * Mi bandeja: las entregas de los cursos que dicto (o de toda la
	 * organización, si soy administrador). Los contadores salen siempre
	 * completos, sin importar el filtro.
	 */
	async bandeja(params: {
		estado?: EstadoBandeja;
		orden?: "antiguas" | "recientes";
		cursoId?: string;
		tenantId?: string | null;
	} = {}) {
		const query = new URLSearchParams();
		if (params.estado) query.set("estado", params.estado);
		if (params.orden) query.set("orden", params.orden);
		if (params.cursoId) query.set("cursoId", params.cursoId);
		if (params.tenantId) query.set("tenantId", params.tenantId);
		const qs = query.toString();
		return await apiFetch<Bandeja>(`/entregas${qs ? `?${qs}` : ""}`);
	},

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
	 * Todas mis entregas, de todos mis cursos (HU-049). Es lo que ve el
	 * aprendiz en su perfil para seguir qué le revisaron y qué le dijeron sin
	 * tener que abrir actividad por actividad.
	 */
	async mias() {
		return await apiFetch<EntregaPropia[]>("/entregas/mias");
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
