import { z } from "zod";

export const createTenantSchema = z.object({
	name: z.string().min(1, "El nombre es obligatorio").max(255),
	domain: z.string().min(1, "El dominio es obligatorio"),
	active: z.boolean(),
});

export type Tenant = z.infer<typeof createTenantSchema>;

export type CreateTenantPayload = z.infer<typeof createTenantSchema>;
