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
	// Resueltos por el backend en /auth/me: el id suelto ("tenant-uc") no
	// sirve para mostrar, y oauthOnly dice si la cuenta tiene contrasena.
	tenantName: z.string().nullish(),
	oauthOnly: z.boolean().nullish(),
	// Solo en el listado de la administración: último día en que usó la
	// plataforma ("YYYY-MM-DD"), o null si nunca entró.
	ultimaConexion: z.string().nullish(),
	racha_maxima: z.number().nullish(),
	// La contraseña es temporal: hay que cambiarla antes de usar la app.
	debeCambiarPassword: z.boolean().nullish(),
});

export const userPayloadSchema = z.object({
	firstname: z.string().min(1, "El nombre es obligatorio"),
	lastname: z.string().min(1, "El apellido es obligatorio"),
	email: z.email("Ingresa un correo válido"),
	password: z.string().min(8, "Debe tener al menos 8 caracteres"),
	// Nunca superadmin: es de la plataforma, no se asigna desde una organización.
	role: z.enum(["student", "instructor", "admin"], "Selecciona un rol"),
	phonumber: z.string().optional(),
	status: z.enum(["Active", "Inactive", "Pending", "Suspended"]),
	// Solo lo manda el superadmin: la organización del administrador que crea.
	tenantId: z.string().optional(),
	// XP, nivel, racha, promedio y misiones no van: se ganan usando la app y
	// el backend descarta lo que llegue.
});

export const updateUserSchema = userPayloadSchema.omit({ password: true });

export type User = z.infer<typeof userSchema>;
export type CreateUserPayload = z.infer<typeof userPayloadSchema>;
export type UpdateUserPayload = z.infer<typeof updateUserSchema>;
