import { z } from "zod";

export const activitySchema = z.object({
	id: z.string(),
	name: z.string(),
	type: z.string(),
	title: z.string(),
	description: z.string(),
	attachment: z.string(),
	deliverable: z.boolean(),
	created_at: z.iso.datetime(),
	mime: z.string(),
	tenantId: z.string(),
});

export type Activity = z.infer<typeof activitySchema>;
