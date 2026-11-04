/** Cuánto XP puede dar un tipo de actividad. */
export interface RangoXp {
	minimo: number;
	recomendado: number;
	maximo: number;
}

/**
 * Los mismos rangos que valida el backend (`GET /activities/reglas-xp`). Se
 * usan mientras llega la respuesta, para que el formulario nunca quede sin
 * saber qué proponer.
 */
export const REGLAS_XP: Record<string, RangoXp> = {
	Recurso: { minimo: 5, recomendado: 10, maximo: 30 },
	Tarea: { minimo: 10, recomendado: 30, maximo: 100 },
	Examen: { minimo: 20, recomendado: 50, maximo: 150 },
	Concurso: { minimo: 10, recomendado: 30, maximo: 100 },
};

export function rangoDe(
	tipo: string,
	reglas: Record<string, RangoXp> = REGLAS_XP,
): RangoXp {
	return reglas[tipo] ?? REGLAS_XP[tipo] ?? REGLAS_XP.Recurso;
}
