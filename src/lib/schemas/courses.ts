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
	// Solo en "mis cursos" del aprendiz: cuánto lleva hecho.
	progreso: z
		.object({ hechas: z.number(), total: z.number(), porcentaje: z.number() })
		.nullish(),
});

export const createCourseSchema = courseSchema
	.omit({
		id: true,
		created_at: true,
		tenantId: true,
		bannerUrl: true,
		archivado: true,
		archivadoAt: true,
		progreso: true,
	})
	.partial({ grupo: true });

export type Course = z.infer<typeof courseSchema>;
export type CreateCoursePayload = z.infer<typeof createCourseSchema>;

/** Resumen que devuelve `GET /courses/me` para el usuario autenticado. */
export const assignedCourseSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullish(),
	image: z.string().nullish(),
	// El backend manda la portada como bannerUrl; image queda por compatibilidad.
	bannerUrl: z.string().nullish(),
	progreso: z
		.object({ hechas: z.number(), total: z.number(), porcentaje: z.number() })
		.nullish(),
});

export type AssignedCourse = z.infer<typeof assignedCourseSchema>;

/**
 * Lo que se completa en los formularios de curso.
 *
 * `grupoId` no es un campo del curso: es el grupo al que se le asigna al
 * guardar (la relación grupo↔curso, que es lo que da acceso a la gente). La
 * columna `grupo` del curso es de texto y no asigna nada, por eso no se usa.
 */
export const courseFormSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "El nombre es obligatorio")
		.max(50, "Máximo 50 caracteres"),
	instructor: z.email("Elige quién dicta el curso"),
	status: z.enum(["Abierto", "Cerrado"], "Elige el estado"),
	grupoId: z.string(),
	actividades: z.array(z.string()),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

/** Lo que acepta `PUT /courses/update/:id`: solo se manda lo que cambió. */
export type UpdateCoursePayload = Partial<
	Pick<CourseFormValues, "name" | "status">
>;

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
			estado: z.enum(["pendiente", "entregada", "completada"]).nullish(),
			completada: z.boolean().nullish(),
			entrega: z.enum(["entregado", "aprobada", "rehacer"]).nullish(),
		}),
	),
});

export type Section = z.infer<typeof sectionSchema>;
export type SectionActivity = Section["actividades"][number];
