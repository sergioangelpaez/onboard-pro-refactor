import { z } from "zod";
import { userSchema } from "./users";

export const groupSchema = z.object({
	id: z.uuid(),
	name: z.string().max(255),
	description: z.string().max(1000),
	createdAt: z.coerce.date(),
	tenantId: z.string(),
	users: z
		.array(
			userSchema.omit({
				level: true,
				average: true,
				streak: true,
				tenantId: true,
				phonumber: true,
				xp: true,
				missions: true,
				status: true,
			}),
		)
		.default([]),
});

export const createGroupSchema = groupSchema
	.pick({ name: true, description: true })
	.extend({ userIds: z.array(z.string().min(1)) });

export const updateGroupSchema = groupSchema.pick({
	name: true,
	description: true,
});

export type Group = z.infer<typeof groupSchema>;
export type CreateGroupPayload = z.infer<typeof createGroupSchema>;
export type UpdateGroupPayload = z.infer<typeof updateGroupSchema>;
