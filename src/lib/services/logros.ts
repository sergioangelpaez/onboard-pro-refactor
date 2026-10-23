import { apiFetch } from "./api-fetch";

export interface Logro {
	id: string;
	nombre: string;
	descripcion: string | null;
	categoria: string;
	condicion: {
		tipo: string;
		meta: number;
		unidad: string | null;
		descripcion: string | null;
	};
	cursoId: string | null;
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
	async getAll(params: { cursoId?: string } = {}) {
		const query = params.cursoId ? `?cursoId=${params.cursoId}` : "";
		return await apiFetch<Logro[]>(`/gamification/logros${query}`);
	},

	async create(payload: CrearLogroPayload) {
		return await apiFetch<{ message: string; logro: Logro }>(
			"/gamification/logros",
			{ method: "POST", body: JSON.stringify(payload) },
		);
	},
};
