import { z } from "zod";

export const userSchema = z.object({
	id: z.string(),
	firstname: z.string().min(1, "El nombre es obligatorio"),
	lastname: z.string().min(1, "El apellido es obligatorio"),
	email: z.email("Ingresa un correo válido"),
	phoneumber: z.string(),
	role: z.string().min(1, "Selecciona un rol"),
	status: z.enum(["active", "inactive", "pending", "suspended"]),
	level: z.number(),
	xp: z.number(),
	streak: z.number(),
	average: z.number(),
	missions: z.string(),
	tenantId: z.string().nullable(),
});

export type User = z.infer<typeof userSchema>;

export const createUserSchema = userSchema
	.pick({ firstname: true, lastname: true, email: true, role: true })
	.extend({ password: z.string().min(8, "Debe tener al menos 8 caracteres") });

export type CreateUserPayload = z.infer<typeof createUserSchema>;
