import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useResetPassword } from "#/hooks/auth/use-reset-password";
import {
	type ResetPasswordFormValues,
	resetPasswordSchema,
} from "#/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { PasswordField } from "../shared/form/password-field";

export function ResetPasswordForm({ token }: { token: string }) {
	const router = useRouter();
	const { mutate, isPending } = useResetPassword();

	const form = useForm({
		defaultValues: {
			nueva: "",
			confirmar: "",
		} satisfies ResetPasswordFormValues,
		validators: { onChange: resetPasswordSchema },
		onSubmit: ({ value }) =>
			mutate(
				{ token, nueva: value.nueva },
				{
					onSuccess: () => {
						toast.success("Contraseña restablecida", {
							description: "Ya puedes iniciar sesión con tu nueva contraseña.",
						});
						router.navigate({ to: "/auth" });
					},
					onError: (error) => {
						toast.error("No se pudo restablecer la contraseña", {
							description: error.message,
						});
					},
				},
			),
	});

	return (
		<Card className="w-full max-w-sm border-none shadow-2xl">
			<CardHeader>
				<CardTitle>Nueva contraseña</CardTitle>
				<CardDescription>
					Elige una nueva contraseña para tu cuenta.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					id="reset-password-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-6"
				>
					<form.Field name="nueva">
						{(field) => (
							<PasswordField
								field={field}
								label="Nueva contraseña"
								autoComplete="new-password"
							/>
						)}
					</form.Field>
					<form.Field name="confirmar">
						{(field) => (
							<PasswordField
								field={field}
								label="Confirmar contraseña"
								autoComplete="new-password"
							/>
						)}
					</form.Field>
				</form>
			</CardContent>
			<CardFooter>
				<form.Subscribe selector={(s) => s.canSubmit}>
					{(canSubmit) => (
						<Button
							type="submit"
							form="reset-password-form"
							className="w-full"
							disabled={!canSubmit || isPending}
						>
							{isPending && <LoaderCircle className="animate-spin" />}
							Restablecer contraseña
						</Button>
					)}
				</form.Subscribe>
			</CardFooter>
		</Card>
	);
}
