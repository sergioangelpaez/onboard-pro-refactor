import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForgotPassword } from "#/hooks/auth/use-forgot-password";
import { forgotPasswordSchema } from "#/lib/schemas/auth";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ForgotPasswordDialogForm() {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useForgotPassword();

	const form = useForm({
		defaultValues: { email: "" },
		validators: { onChange: forgotPasswordSchema },
		onSubmit: ({ value }) =>
			mutate(value, {
				onSuccess: () => {
					toast.success("Revisa tu correo", {
						description:
							"Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña. Vence en 60 minutos.",
					});
					handleOpenChange(false);
				},
				onError: (error) => {
					toast.error("No se pudo enviar la solicitud", {
						description: error.message,
					});
				},
			}),
	});

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) form.reset();
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="link"
					className="h-auto p-0 text-xs font-normal"
				>
					¿Olvidaste tu contraseña?
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Recuperar contraseña</DialogTitle>
					<DialogDescription>
						Ingresa tu correo y te enviaremos un enlace para restablecerla.
					</DialogDescription>
				</DialogHeader>

				<form
					id="forgot-password-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
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
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isPending}
					>
						Cancelar
					</Button>
					<form.Subscribe selector={(s) => s.canSubmit}>
						{(canSubmit) => (
							<Button
								type="submit"
								form="forgot-password-form"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Enviar enlace
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
