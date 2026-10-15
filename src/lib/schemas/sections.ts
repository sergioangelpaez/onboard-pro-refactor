// lib/schemas/sections.ts
import { z } from "zod";

export const sectionActivitySchema = z.object({
	id: z.string(),
	name: z.string(),
	title: z.string(),
	type: z.enum(["Recurso", "Tarea", "Examen"]),
	description: z.string(),
	deliverable: z.boolean(),
	adjunto: z.string(),
	mime: z.string(),
	orden: z.number(),
	section_id: z.string(),
});

export const sectionSchema = z.object({
	id: z.string(),
	name: z.string(),
	orden: z.number(),
	created_at: z.string(),
	courseId: z.string(),
	tenantId: z.string(),
	actividades: z.array(sectionActivitySchema),
});

export type SectionActivity = z.infer<typeof sectionActivitySchema>;
export type Section = z.infer<typeof sectionSchema>;
