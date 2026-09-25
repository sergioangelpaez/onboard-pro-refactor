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
});

export const createCourseSchema = courseSchema.omit({
	id: true,
	created_at: true,
	tenantId: true,
	bannerUrl: true,
});

export type Course = z.infer<typeof courseSchema>;
export type CreateCoursePayload = z.infer<typeof createCourseSchema>;
