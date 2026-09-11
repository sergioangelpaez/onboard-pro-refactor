// components/users/create-user-dialog.tsx
import { type FormEvent, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { useCreateUser } from "@/hooks/users/use-create-user";

interface FormState {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	role: string;
}

const INITIAL_STATE: FormState = {
	firstname: "",
	lastname: "",
	email: "",
	password: "",
	role: "",
};

export function CreateUserDialog() {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<FormState>(INITIAL_STATE);
	const [formError, setFormError] = useState<string | null>(null);

	const { mutate, isPending, error, isError } = useCreateUser();

	function resetAndClose() {
		setForm(INITIAL_STATE);
		setFormError(null);
		setOpen(false);
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setFormError(null);

		if (
			!form.firstname.trim() ||
			!form.lastname.trim() ||
			!form.email.trim() ||
			!form.password.trim() ||
			!form.role.trim()
		) {
			setFormError("Todos los campos son obligatorios.");
			return;
		}

		const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailPattern.test(form.email.trim())) {
			setFormError("El email no tiene un formato válido.");
			return;
		}

		if (form.password.length < 8) {
			setFormError("La contraseña debe tener al menos 8 caracteres.");
			return;
		}

		mutate(
			{
				firstname: form.firstname.trim(),
				lastname: form.lastname.trim(),
				email: form.email.trim(),
				password: form.password,
				role: form.role.trim(),
			},
			{
				onSuccess: resetAndClose,
			},
		);
	}

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				setOpen(nextOpen);
				if (!nextOpen) {
					setForm(INITIAL_STATE);
					setFormError(null);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button>Nuevo usuario</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear usuario</DialogTitle>
					<DialogDescription>
						Completa los datos para registrar un nuevo usuario.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-2">
							<Label htmlFor="firstname">Nombre</Label>
							<Input
								id="firstname"
								value={form.firstname}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, firstname: e.target.value }))
								}
								placeholder="Juan"
								disabled={isPending}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="lastname">Apellido</Label>
							<Input
								id="lastname"
								value={form.lastname}
								onChange={(e) =>
									setForm((prev) => ({ ...prev, lastname: e.target.value }))
								}
								placeholder="Pérez"
								disabled={isPending}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="email">Email</Label>
						<Input
							id="email"
							type="email"
							value={form.email}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, email: e.target.value }))
							}
							placeholder="juan@ucentral.edu.co"
							disabled={isPending}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="password">Contraseña</Label>
						<Input
							id="password"
							type="password"
							value={form.password}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, password: e.target.value }))
							}
							placeholder="••••••••"
							disabled={isPending}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="role">Rol</Label>
						<Input
							id="role"
							value={form.role}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, role: e.target.value }))
							}
							placeholder="student, teacher, admin..."
							disabled={isPending}
						/>
					</div>

					{(formError || isError) && (
						<p className="text-sm text-red-600">
							{formError ?? error?.message ?? "Ocurrió un error inesperado."}
						</p>
					)}

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={resetAndClose}
							disabled={isPending}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={isPending}>
							{isPending ? "Creando..." : "Crear usuario"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
