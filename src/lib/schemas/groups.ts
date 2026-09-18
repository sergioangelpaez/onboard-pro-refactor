import { z } from "zod";

export const groupSchema = z.object({
	id: z.uuid(),
	name: z.string().max(255),
	description: z.string().max(1000),
	userIds: z.array(z.string().min(1)),
});

export const createGroupSchema = groupSchema.omit({ id: true });

export type Group = z.infer<typeof groupSchema>;
export type CreateGroupPayload = z.infer<typeof createGroupSchema>;
