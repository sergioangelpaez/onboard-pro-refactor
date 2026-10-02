import { z } from "zod";

export const userSchema = z.object({
	id: z.string(),
	email: z.email(),
	firstname: z.string(),
	lastname: z.string(),
	phonumber: z.string(),
	role: z.string(),
	status: z.enum(["Active", "Inactive", "Pending", "Suspended"]),
	level: z.number(),
	xp: z.number(),
	streak: z.number(),
	average: z.number(),
	missions: z.string(),
	tenantId: z.string().nullable(),
});

export const userPayloadSchema = z.object({
	firstname: z.string().min(1, "El nombre es obligatorio"),
	lastname: z.string().min(1, "El apellido es obligatorio"),
	email: z.email("Ingresa un correo válido"),
	password: z.string().min(8, "Debe tener al menos 8 caracteres"),
	role: z.string().min(1, "Selecciona un rol"),
	phonumber: z.string().optional(),
	status: z.enum(["Active", "Inactive", "Pending", "Suspended"]),
	level: z.number(),
	xp: z.number(),
	streak: z.number(),
	average: z.number(),
	missions: z.string(),
});

export const updateUserSchema = userPayloadSchema.omit({ password: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserPayload = z.infer<typeof userPayloadSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
