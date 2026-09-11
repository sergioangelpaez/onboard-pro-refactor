import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Separator } from "#/components/ui/separator";
import { loginFormSchema } from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";
import type { ApiError } from "#/lib/services/errors";
import { queryKeys } from "#/lib/utils/query-keys";
import GoogleLogo from "@/assets/google-logo.svg";
import MicrosoftLogo from "@/assets/microsoft-logo.svg";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import type { loginFormValues } from "@/lib/schemas/auth";

export function LoginForm() {
	const router = useRouter();
	const queryClient = useQueryClient();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		validators: {
			onChange: loginFormSchema,
		},
		onSubmit: async ({ value }) => {
			await loginFormMutation.mutateAsync(value);
		},
	});

	const loginFormMutation = useMutation({
		mutationFn: async (values: loginFormValues) => {
			return await authService.logIn(values);
		},
		onMutate: () => {
			const toastId = toast.loading("Iniciando sesión...");
			return { toastId };
		},
		onSuccess: async (_data, _variables, mutationContext) => {
			form.reset();
			toast.success("¡Bienvenido de nuevo!", { id: mutationContext?.toastId });

			await queryClient.invalidateQueries({ queryKey: queryKeys.users.me });

			router.navigate({ to: "/home" });
		},
		onError: (error: ApiError, _variables, mutationContext) => {
			toast.error(
				error?.message ||
					"Ocurrió un error al iniciar sesión. Intenta nuevamente.",
				{ id: mutationContext?.toastId },
			);
		},
	});

	const handleGoogleLogin = () => {
		window.location.href = authService.googleLogin();
	};

	const handleMicrosoftLogin = () => {
		window.location.href = authService.microsoftLogin();
	};

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
				>
					<div className="flex flex-col gap-6">
						<form.Field name="email">
							{(field) => {
								return (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>
											Correo Electrónico
										</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											placeholder="correo@ejemplo.com"
											autoComplete="off"
										/>
										{!field.state.meta.isValid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="password">
							{(field) => {
								return (
									<Field data-invalid={!field.state.meta.isValid}>
										<FieldLabel htmlFor={field.name}>Contraseña</FieldLabel>
										<Input
											id={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											type="password"
											autoComplete="off"
										/>
										{!field.state.meta.isValid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
					</div>
				</form>
			</CardContent>
			<CardFooter className="w-full flex-col gap-2">
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
				>
					{([canSubmit, isSubmitting]) => (
						<Button
							type="submit"
							className="w-full"
							disabled={!canSubmit}
							form="login-form"
						>
							{isSubmitting ? (
								<>
									<LoaderCircle className="animate-spin" />{" "}
									<span>Ingresando...</span>
								</>
							) : (
								"Ingresar"
							)}
						</Button>
					)}
				</form.Subscribe>
				<div className="my-2 grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4">
					<Separator orientation="horizontal" />
					<p>o</p>
					<Separator />
				</div>
				<Button
					variant="outline"
					className="w-full"
					onClick={handleGoogleLogin}
				>
					<img
						src={GoogleLogo}
						alt=""
						className="h-5 w-5"
						fetchPriority="high"
					/>
					Ingresar con Google
				</Button>
				<Button
					variant="outline"
					className="w-full"
					onClick={handleMicrosoftLogin}
				>
					<img
						src={MicrosoftLogo}
						alt=""
						className="h-5 w-5"
						fetchPriority="high"
					/>
					Ingresar con Microsoft
				</Button>
			</CardFooter>
		</Card>
	);
}
