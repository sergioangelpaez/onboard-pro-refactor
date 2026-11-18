import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { KeyRound, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { PasswordField } from "#/components/shared/form/password-field";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import { useChangePassword } from "#/hooks/auth/use-change-password";
import {
	type ChangePasswordFormValues,
	changePasswordSchema,
} from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";
import { tokenStorage } from "#/lib/services/token-storage";
import {
	currentUserQueryOptions,
	getCurrentUser,
	getHomeByRole,
} from "#/lib/utils/auth/session";
import backGroundImage from "@/assets/universidad-central.webp";

/**
 * Primer ingreso con una contraseña temporal (la puso un administrador).
 *
 * Mientras no la cambie, el backend rechaza todo lo demás con 403, así que
 * esta pantalla va sin menú: no hay a dónde más ir. Si la persona llega acá
 * sin tener que cambiarla, se la manda a su inicio.
 */
export const Route = createFileRoute("/(auth)/cambiar-password")({
	ssr: false,
	beforeLoad: async ({ context }) => {
		if (!tokenStorage.get()) throw redirect({ to: "/auth" });
		const user = await getCurrentUser(context.queryClient);
		if (!user) throw redirect({ to: "/auth" });
		if (!user.debeCambiarPassword)
			throw redirect({ to: getHomeByRole(user.role) });
		return { user };
	},
	component: CambiarPasswordRoute,
});

function CambiarPasswordRoute() {
	const { user } = Route.useRouteContext();
	const router = useRouter();
	const queryClient = useQueryClient();
	const { mutate, isPending } = useChangePassword();

	const form = useForm({
		defaultValues: {
			actual: "",
			nueva: "",
			confirmar: "",
		} as ChangePasswordFormValues,
		validators: { onChange: changePasswordSchema },
		onSubmit: ({ value }) =>
			mutate(
				{ actual: value.actual, nueva: value.nueva },
				{
					onSuccess: async () => {
						toast.success("Contraseña actualizada", {
							description: "Ya puedes usar la plataforma.",
						});
						// El servicio ya guardó el token nuevo; el usuario cacheado
						// todavía dice que la contraseña es temporal.
						queryClient.removeQueries({
							queryKey: currentUserQueryOptions.queryKey,
						});
						await router.navigate({ to: "/" });
					},
					onError: (error) => {
						toast.error("No se pudo cambiar la contraseña", {
							description: error.message,
						});
					},
				},
			),
	});

	return (
		<div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4">
			<img
				src={backGroundImage}
				alt=""
				className="absolute inset-0 -z-10 h-full w-full object-cover"
			/>
			<div className="absolute inset-0 -z-10 bg-black/50" />

			<Card className="w-full max-w-sm border-none shadow-2xl">
				<CardHeader>
					<span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
						<KeyRound className="size-5" />
					</span>
					<CardTitle>Cambia tu contraseña temporal</CardTitle>
					<CardDescription>
						Hola{user.firstname ? `, ${user.firstname}` : ""}. Tu cuenta se creó
						con una contraseña temporal. Para continuar, elige una nueva que
						solo tú conozcas.
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form
						id="cambiar-password-form"
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="flex flex-col gap-4"
					>
						<form.Field name="actual">
							{(field) => (
								<PasswordField
									field={field}
									label="Contraseña temporal"
									autoComplete="current-password"
								/>
							)}
						</form.Field>
						<form.Field name="nueva">
							{(field) => (
								<PasswordField
									field={field}
									label="Nueva contraseña"
									autoComplete="new-password"
									description="Al menos 8 caracteres."
								/>
							)}
						</form.Field>
						<form.Field name="confirmar">
							{(field) => (
								<PasswordField
									field={field}
									label="Confirmar nueva contraseña"
									autoComplete="new-password"
								/>
							)}
						</form.Field>
					</form>
				</CardContent>

				<CardFooter className="flex flex-col gap-2">
					<form.Subscribe selector={(s) => s.canSubmit}>
						{(canSubmit) => (
							<Button
								type="submit"
								form="cambiar-password-form"
								className="w-full"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Guardar y continuar
							</Button>
						)}
					</form.Subscribe>
					<Button
						type="button"
						variant="ghost"
						className="w-full"
						onClick={() => authService.logOut()}
						disabled={isPending}
					>
						Cerrar sesión
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
}
