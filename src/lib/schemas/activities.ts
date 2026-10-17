import { z } from "zod";

/**
 * Lo que devuelve `GET /activities/get/all`.
 *
 * Los nombres salen del backend tal cual: `adjunto`, no `attachment`. El
 * esquema anterior decía `attachment` y el campo nunca llegaba, así que el
 * tipo mentía sin que nadie se enterara (apiFetch no valida en tiempo de
 * ejecución, solo castea).
 */
export const activitySchema = z.object({
	id: z.string(),
	name: z.string(),
	title: z.string(),
	type: z.enum(["Recurso", "Tarea", "Examen"]).or(z.string()),
	description: z.string().nullish(),
	deliverable: z.boolean(),
	xp: z.number(),
	orden: z.number().nullish(),
	created_at: z.string(),

	// La ruta del adjunto heredado. Los archivos nuevos viven en `materiales`.
	adjunto: z.string().nullish(),
	mime: z.string().nullish(),

	tenantId: z.string().nullish(),
	sectionId: z.string().nullish(),
	// El backend resuelve estos nombres para no tener que pedir el árbol entero.
	sectionName: z.string().nullish(),
	courseId: z.string().nullish(),
	courseName: z.string().nullish(),
});

export type Activity = z.infer<typeof activitySchema>;

/** Un archivo de apoyo de la actividad. `url` es temporal: vence en una hora. */
export const materialSchema = z.object({
	id: z.string(),
	actividadId: z.string(),
	nombre: z.string(),
	mime: z.string().nullish(),
	tamano: z.number().nullish(),
	orden: z.number(),
	subidoPor: z.string().nullish(),
	subidoEn: z.string(),
	url: z.string().nullish(),
});

export type Material = z.infer<typeof materialSchema>;
