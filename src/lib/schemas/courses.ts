import { z } from "zod";

export const courseSchema = z.object({
	id: z.uuid(),
	name: z.string().max(255),
	description: z.string().max(1000).optional(),
	userIds: z.array(z.uuid()).default([]),
});

export type Course = z.infer<typeof courseSchema>;

export const createCourseSchema = courseSchema.omit({ id: true });
export type CreateCoursePayloadSchema = z.infer<typeof createCourseSchema>;

export type CreateCourseFormInput = z.input<typeof createCourseSchema>;
