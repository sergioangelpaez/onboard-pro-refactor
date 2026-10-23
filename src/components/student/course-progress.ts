import type { Section } from "#/lib/schemas/courses";

/** Cuántas actividades del curso terminó el aprendiz, a partir de sus secciones. */
export function progresoDe(secciones: Section[] | undefined) {
	const actividades = (secciones ?? []).flatMap((s) => s.actividades);
	const hechas = actividades.filter((a) => a.completada).length;
	const total = actividades.length;
	return {
		hechas,
		total,
		porcentaje: total ? Math.round((hechas * 100) / total) : 0,
	};
}
