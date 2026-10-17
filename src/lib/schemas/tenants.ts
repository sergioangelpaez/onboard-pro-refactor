import { z } from "zod";

export const tenantSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1, "El nombre es obligatorio").max(255),
	domain: z.string().min(1, "El dominio es obligatorio"),
	active: z.boolean(),
});

export const createTenantSchema = tenantSchema.omit({ id: true });

export type Tenant = z.infer<typeof tenantSchema>;

export type TenantPayload = z.infer<typeof createTenantSchema>;
