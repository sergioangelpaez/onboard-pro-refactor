import { z } from "zod";

export const courseSchema = z.object({
	id: z.uuid(),
	name: z.string().max(255),
	description: z.string().max(1000),
	userIds: z.array(z.uuid()).default([]),
});

export const createCourseSchema = courseSchema.omit({
	id: true,
	userIds: true,
});

export type Course = z.infer<typeof courseSchema>;
export type CreateCoursePayload = z.infer<typeof createCourseSchema>;
