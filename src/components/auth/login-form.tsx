import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useLogin } from "#/hooks/auth/use-login";
import { authService } from "#/lib/services/auth";
import GoogleLogo from "@/assets/google-logo.svg";
import MicrosoftLogo from "@/assets/microsoft-logo.svg";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { type LoginFormValues, loginFormSchema } from "@/lib/schemas/auth";
import { PasswordField } from "../shared/form/password-field";
import { ForgotPasswordDialogForm } from "./forgot-password-dialog-form";

export function LoginForm() {
	const router = useRouter();
	const { mutate, isPending } = useLogin();

	const form = useForm({
		defaultValues: { email: "", password: "" } satisfies LoginFormValues,
		validators: { onChange: loginFormSchema },
		onSubmit: ({ value }) =>
			mutate(value, {
				onSuccess: () => {
					toast.success("¡Bienvenido de nuevo!");
					router.navigate({ to: "/home" });
				},
				onError: (error) => {
					toast.error("Error al iniciar sesión", {
						description:
							error.message || "Ocurrió un error. Intenta nuevamente.",
					});
				},
			}),
	});

	return (
		<Card className="w-full max-w-sm border-none shadow-2xl">
			<CardHeader>
				<CardTitle>Ingresa a tu cuenta</CardTitle>
				<CardDescription>
					Ingresa tu correo electrónico y contraseña para acceder a tu cuenta.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					id="login-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-6"
				>
					<form.Field name="email">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Correo electrónico
									</FieldLabel>
									<Input
										id={field.name}
										type="email"
										autoComplete="email"
										placeholder="correo@ejemplo.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="password">
						{(field) => (
							<PasswordField
								field={field}
								label="Contraseña"
								autoComplete="current-password"
								labelAction={<ForgotPasswordDialogForm />}
							/>
						)}
					</form.Field>
				</form>
			</CardContent>

			<CardFooter className="w-full flex-col gap-2">
				<form.Subscribe selector={(s) => s.canSubmit}>
					{(canSubmit) => (
						<Button
							type="submit"
							form="login-form"
							className="w-full"
							disabled={!canSubmit || isPending}
						>
							{isPending ? (
								<>
									<LoaderCircle className="animate-spin" />
									<span>Ingresando...</span>
								</>
							) : (
								"Ingresar"
							)}
						</Button>
					)}
				</form.Subscribe>

				<div className="my-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
					<Separator />
					<p>o</p>
					<Separator />
				</div>

				<Button
					type="button"
					variant="outline"
					className="w-full"
					disabled={isPending}
					onClick={() => {
						window.location.href = authService.googleLogin();
					}}
				>
					<img src={GoogleLogo} alt="" className="h-5 w-5" />
					Ingresar con Google
				</Button>
				<Button
					type="button"
					variant="outline"
					className="w-full"
					disabled={isPending}
					onClick={() => {
						window.location.href = authService.microsoftLogin();
					}}
				>
					<img src={MicrosoftLogo} alt="" className="h-5 w-5" />
					Ingresar con Microsoft
				</Button>
			</CardFooter>
		</Card>
	);
}
