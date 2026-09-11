import { z } from "zod";

export const loginFormSchema = z.object({
	email: z.email("Correo electrónico inválido").min(1, "Ingresa tu correo"),
	password: z.string().min(6, "Ingresa tu contraseña (mínimo 6 caracteres)"),
});

export type loginFormValues = z.infer<typeof loginFormSchema>;
