// components/profile/change-password-dialog.tsx
import { type AnyFieldApi, useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useChangePassword } from "#/hooks/auth/use-change-password";
import {
	type ChangePasswordFormValues,
	changePasswordSchema,
} from "#/lib/schemas/auth";
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

export function ChangePasswordDialog() {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useChangePassword();

	const form = useForm({
		defaultValues: {
			actual: "",
			nueva: "",
			confirmar: "",
		} satisfies ChangePasswordFormValues,
		validators: { onChange: changePasswordSchema },
		onSubmit: ({ value }) =>
			mutate(
				{ actual: value.actual, nueva: value.nueva },
				{
					onSuccess: () => {
						toast.success("Contraseña actualizada");
						handleOpenChange(false);
					},
					onError: (error) => {
						toast.error("No se pudo cambiar la contraseña", {
							description: error.message,
						});
					},
				},
			),
	});

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) form.reset();
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button variant="default">Cambiar contraseña</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Cambiar contraseña</DialogTitle>
					<DialogDescription>
						Ingresa tu contraseña actual y elige una nueva.
					</DialogDescription>
				</DialogHeader>

				<form
					id="change-password-form"
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
								label="Contraseña actual"
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
								form="change-password-form"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Cambiar contraseña
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function PasswordField({
	field,
	label,
	autoComplete,
}: {
	field: AnyFieldApi;
	label: string;
	autoComplete: string;
}) {
	const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
	return (
		<Field data-invalid={isInvalid}>
			<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
			<Input
				id={field.name}
				type="password"
				autoComplete={autoComplete}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e) => field.handleChange(e.target.value)}
			/>
			{isInvalid && <FieldError errors={field.state.meta.errors} />}
		</Field>
	);
}
