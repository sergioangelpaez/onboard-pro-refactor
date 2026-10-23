import { apiFetch } from "./api-fetch";

export interface Nivel {
	numero: number;
	xpMinimo: number;
	nombre: string | null;
}

export interface TablaNiveles {
	/** false: la organización usa la curva por defecto. */
	personalizada: boolean;
	niveles: Nivel[];
}

export interface TablaGuardada extends TablaNiveles {
	message: string;
	/** Cuántas personas quedaron en otro nivel al recalcular. */
	personasConNivelNuevo: number;
}

const conTenant = (tenantId: string | null) =>
	tenantId ? `?tenantId=${tenantId}` : "";

/**
 * La tabla de niveles de la organización (HU-053). `tenantId` solo lo usa el
 * superadmin; para el resto el backend toma la organización del token.
 */
export const nivelesService = {
	async get(tenantId: string | null = null) {
		return await apiFetch<TablaNiveles>(
			`/gamification/niveles${conTenant(tenantId)}`,
		);
	},

	/**
	 * Guarda la tabla entera, en orden (el primero es el nivel 1). Recalcula el
	 * nivel de todas las personas de la organización: algunas pueden bajar.
	 */
	async save(
		niveles: { xpMinimo: number; nombre: string }[],
		tenantId: string | null = null,
	) {
		return await apiFetch<TablaGuardada>("/gamification/niveles", {
			method: "PUT",
			body: JSON.stringify({ niveles, ...(tenantId ? { tenantId } : {}) }),
		});
	},

	/** Vuelve a la curva por defecto y recalcula. */
	async restore(tenantId: string | null = null) {
		return await apiFetch<TablaGuardada>(
			`/gamification/niveles${conTenant(tenantId)}`,
			{
				method: "DELETE",
			},
		);
	},
};
