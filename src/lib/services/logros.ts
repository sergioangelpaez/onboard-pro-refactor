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

/** Un logro tal como lo ve quien puede ganarlo: con su progreso. */
export interface MiLogro
	extends Omit<Logro, "activo" | "tenantId" | "generico"> {
	desbloqueado: boolean;
	desbloqueadoAt: string | null;
	/** Recién ganado en esta consulta: para celebrarlo. */
	nuevo?: boolean;
	progreso: { actual: number | null; meta: number; porcentaje: number };
}

export interface MisLogros {
	ganados: number;
	total: number;
	nuevos: number;
	/** Primero los ganados (del más reciente), después los que faltan (del más avanzado). */
	logros: MiLogro[];
}

/** `POST /gamification/logros/vista-previa`: cuántos cumplirían hoy una condición. */
export interface VistaPreviaLogro {
	condicion: { tipo: string; meta: number; descripcion: string | null };
	aprendices: number;
	cumplirian: number;
	porcentaje: number;
	/** Con muchas personas se mide una muestra: el número es aproximado. */
	estimado: boolean;
	ejemplos: { id: string; firstname: string; lastname: string }[];
}

/** Lo que se puede cambiar de un logro. Lo que no se manda no se toca. */
export interface EditarLogroPayload {
	nombre?: string;
	descripcion?: string | null;
	meta?: number;
	xpRecompensa?: number;
	activo?: boolean;
}

/** `POST /gamification/logros/cierre-ranking`. */
export interface CierreRanking {
	message: string;
	tenantId: string;
	medallasEvaluadas: number;
	otorgados: {
		persona: { id: string; firstname: string; lastname?: string };
		logro: { id: string; nombre: string; icono?: string };
	}[];
}

export const logrosService = {
	/**
	 * Mide una condición sobre los aprendices de la organización sin guardar
	 * nada: para ver si la meta es demasiado fácil o imposible antes de crearla.
	 */
	async vistaPrevia(payload: {
		tipoCondicion: string;
		meta: number;
		cursoId?: string;
		tenantId?: string | null;
	}) {
		return await apiFetch<VistaPreviaLogro>(
			"/gamification/logros/vista-previa",
			{ method: "POST", body: JSON.stringify(payload) },
		);
	},

	/** Cambiar la condición no le quita el logro a quien ya lo ganó. */
	async update(id: string, payload: EditarLogroPayload) {
		return await apiFetch<{ message: string; logro: Logro }>(
			`/gamification/logros/${id}`,
			{ method: "PUT", body: JSON.stringify(payload) },
		);
	},

	async remove(id: string) {
		return await apiFetch<{ message: string }>(`/gamification/logros/${id}`, {
			method: "DELETE",
		});
	},

	/**
	 * Cierra el periodo del ranking: otorga las medallas de posición a quien
	 * está en el puesto. Las de ranking no se dan en tiempo real.
	 */
	async cerrarRanking(tenantId: string | null = null) {
		return await apiFetch<CierreRanking>(
			"/gamification/logros/cierre-ranking",
			{
				method: "POST",
				body: JSON.stringify(tenantId ? { tenantId } : {}),
			},
		);
	},

	/** Mis logros, ganados y por ganar. Consultarlos no otorga nada: eso pasa al ganar XP. */
	async mine() {
		return await apiFetch<MisLogros>("/gamification/logros/mios");
	},

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
