import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_MIME = [
	"application/pdf",
	"video/mp4",
	"video/webm",
	"video/quicktime",
];

const fileSchema = z
	.custom<File>((v) => v instanceof File, "Adjunta un archivo")
	.refine((f) => f.size <= MAX_FILE_SIZE, "El archivo supera los 50 MB")
	.refine(
		(f) => f.type.startsWith("image/") || ACCEPTED_MIME.includes(f.type),
		"Formato no permitido (imágenes, PDF o video mp4, webm, mov)",
	);

export const activitySchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(["Recurso", "Tarea", "Examen"]),
	title: z.string(),
	description: z.string(),
	// Desde HU-039 se puede quitar el material: la actividad queda sin adjunto.
	adjunto: z.string().nullish(),
	deliverable: z.boolean(),
	created_at: z.string(),
	mime: z.string().nullish(),
	orden: z.number(),
	xp: z.number(),
	tenantId: z.string(),
	sectionId: z.string(),
	sectionName: z.string(),
	courseId: z.string(),
	courseName: z.string(),
});

export const createActivitySchema = activitySchema
	.pick({
		name: true,
		title: true,
		type: true,
		description: true,
		deliverable: true,
		sectionId: true,
		adjunto: true,
	})
	.extend({
		archivo: fileSchema,
	});

export const createActivityFormSchema = createActivitySchema
	.omit({ adjunto: true })
	.extend({
		// El rango depende del tipo: lo valida el campo, que conoce las reglas.
		xp: z.number().int().min(0, "El XP no puede ser negativo"),
		// Un examen se arma con preguntas: el archivo es opcional solo para él.
		archivo: fileSchema.nullish(),
	})
	.superRefine((value, ctx) => {
		if (value.type !== "Examen" && !value.archivo) {
			ctx.addIssue({
				code: "custom",
				path: ["archivo"],
				message: "Adjunta un archivo",
			});
		}
	});

export const updateActivityFormSchema = createActivitySchema
	.omit({ adjunto: true, sectionId: true })
	.extend({
		xp: z.number().int().min(0, "El XP no puede ser negativo"),
		archivo: fileSchema.nullish(),
	});

export type Activity = z.infer<typeof activitySchema>;
export type CreateActivityPayload = z.infer<typeof createActivitySchema>;
export type CreateActivityFormValues = z.infer<typeof createActivityFormSchema>;
export type UpdateActivityFormValues = z.infer<typeof updateActivityFormSchema>;
export type ActivityFormValues = CreateActivityFormValues;

/** Un archivo de apoyo de la actividad (HU-037). `url` vence en una hora. */
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
	/** pdf, video, imagen, audio, enlace o archivo. */
	tipo: z
		.enum(["pdf", "video", "imagen", "audio", "enlace", "archivo"])
		.nullish(),
	/** Si se puede ver dentro de la plataforma sin descargarlo. */
	previsualizable: z.boolean().nullish(),
});

export type Material = z.infer<typeof materialSchema>;
