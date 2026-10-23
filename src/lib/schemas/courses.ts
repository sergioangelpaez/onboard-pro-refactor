import { z } from "zod";

export const courseSchema = z.object({
	id: z.string(),
	name: z.string().max(255),
	instructor: z.email(),
	grupo: z.string(),
	status: z.string(),
	actividades: z.array(z.string()),
	created_at: z.iso.datetime({ offset: true }),
	tenantId: z.string(),
	bannerUrl: z.url().nullable(),
	archivado: z.boolean().nullish(),
	archivadoAt: z.string().nullish(),
	// Solo lo manda el backend cuando hay varias organizaciones a la vista.
	tenantName: z.string().nullish(),
});

export const createCourseSchema = courseSchema.omit({
	id: true,
	created_at: true,
	tenantId: true,
	bannerUrl: true,
	archivado: true,
	archivadoAt: true,
});

export type Course = z.infer<typeof courseSchema>;
export type CreateCoursePayload = z.infer<typeof createCourseSchema>;

/** Una seccion del curso con las actividades que cuelgan de ella. */
export const sectionSchema = z.object({
	id: z.string(),
	name: z.string(),
	orden: z.number(),
	courseId: z.string().nullish(),
	actividades: z.array(
		z.object({
			id: z.string(),
			name: z.string().nullish(),
			title: z.string(),
			type: z.string(),
			description: z.string().nullish(),
			deliverable: z.boolean().nullish(),
			adjunto: z.string().nullish(),
			mime: z.string().nullish(),
			orden: z.number().nullish(),
			xp: z.number().nullish(),
			// Solo vienen cuando quien pide es un aprendiz.
			completada: z.boolean().nullish(),
			entrega: z.enum(["entregado", "aprobada", "rehacer"]).nullish(),
		}),
	),
});

export type Section = z.infer<typeof sectionSchema>;
export type SectionActivity = Section["actividades"][number];
