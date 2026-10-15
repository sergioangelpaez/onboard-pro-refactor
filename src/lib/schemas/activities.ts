import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_MIME = [
	"application/pdf",
	"video/mp4",
	"video/webm",
	"video/quicktime",
];

export const activitySchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.enum(["Recurso", "Tarea", "Examen"]),
	title: z.string(),
	description: z.string(),
	adjunto: z.string(),
	deliverable: z.boolean(),
	created_at: z.string(),
	mime: z.string(),
	orden: z.number(),
	xp: z.number(),
	tenantId: z.string(),
	sectionId: z.string(),
	sectionName: z.string(),
	courseId: z.string(),
	courseName: z.string(),
});

export const createActivitySchema = activitySchema.pick({
	name: true,
	title: true,
	type: true,
	description: true,
	deliverable: true,
	sectionId: true,
	adjunto: true,
});

export const createActivityFormSchema = createActivitySchema
	.omit({ adjunto: true })
	.extend({
		archivo: z
			.custom<File>((v) => v instanceof File, "Adjunta un archivo")
			.refine((f) => f.size <= MAX_FILE_SIZE, "El archivo supera los 50 MB")
			.refine(
				(f) => f.type.startsWith("image/") || ACCEPTED_MIME.includes(f.type),
				"Formato no permitido (imágenes, PDF o video mp4, webm, mov)",
			),
	});

export type Activity = z.infer<typeof activitySchema>;
export type CreateActivityPayload = z.infer<typeof createActivitySchema>;
export type CreateActivityFormValues = z.infer<typeof createActivityFormSchema>;
