import { z } from "zod";

export const loginFormSchema = z.object({
	email: z.email("Correo electrónico inválido").min(1, "Ingresa tu correo"),
	password: z.string().min(6, "Ingresa tu contraseña (mínimo 6 caracteres)"),
});

export type loginFormValues = z.infer<typeof loginFormSchema>;

export const changePasswordSchema = z
	.object({
		actual: z.string().min(1, "Ingresa tu contraseña actual"),
		nueva: z.string().min(8, "Debe tener al menos 8 caracteres"),
		confirmar: z.string(),
	})
	.refine((data) => data.nueva !== data.actual, {
		path: ["nueva"],
		message: "La nueva contraseña debe ser distinta a la actual",
	})
	.refine((data) => data.nueva === data.confirmar, {
		path: ["confirmar"],
		message: "Las contraseñas no coinciden",
	});

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
export type ChangePasswordPayload = Pick<
	ChangePasswordFormValues,
	"actual" | "nueva"
>;

const newPasswordRule = z.string().min(8, "Debe tener al menos 8 caracteres");

export const forgotPasswordSchema = z.object({
	email: z.email("Ingresa un correo válido"),
});
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
	.object({
		nueva: newPasswordRule,
		confirmar: z.string(),
	})
	.refine((data) => data.nueva === data.confirmar, {
		path: ["confirmar"],
		message: "Las contraseñas no coinciden",
	});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordPayload = { token: string; nueva: string };
