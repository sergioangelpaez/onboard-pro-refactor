import { apiFetch } from "./api-fetch";

export interface Logro {
	id: string;
	nombre: string;
	descripcion: string | null;
	categoria: string;
	/** Emoji o nombre de ícono. Si el logro no tiene uno propio, viene el de su categoría. */
	icono: string;
	iconoPropio: boolean;
	condicion: {
		tipo: string;
		meta: number;
		unidad: string | null;
		descripcion: string | null;
	};
	cursoId: string | null;
	/** Sin organización: lo creó el superadmin y vale para todas. */
	generico: boolean;
	tenantId: string | null;
	xpRecompensa: number;
	activo: boolean;
}

export interface CrearLogroPayload {
	nombre: string;
	descripcion?: string;
	categoria: string;
	tipoCondicion: string;
	meta: number;
	xpRecompensa?: number;
	/** Ata el logro a un curso. Sin esto vale para toda la organizacion. */
	cursoId?: string;
}

export const logrosService = {
	/**
	 * `tenantId` solo lo usa el superadmin: trae los logros de esa organización
	 * más los genéricos. Para el resto el backend usa siempre la del token.
	 */
	async getAll(params: { cursoId?: string; tenantId?: string | null } = {}) {
		const query = new URLSearchParams();
		if (params.cursoId) query.set("cursoId", params.cursoId);
		if (params.tenantId) query.set("tenantId", params.tenantId);
		const qs = query.toString();
		return await apiFetch<Logro[]>(`/gamification/logros${qs ? `?${qs}` : ""}`);
	},

	async create(payload: CrearLogroPayload) {
		return await apiFetch<{ message: string; logro: Logro }>(
			"/gamification/logros",
			{ method: "POST", body: JSON.stringify(payload) },
		);
	},
};
