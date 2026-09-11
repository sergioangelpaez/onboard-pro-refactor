// components/organizations/create-organization-dialog.tsx
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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateTenant } from "@/hooks/tenants/use-create-tenant";

interface FormState {
	name: string;
	domain: string;
	active: boolean;
}

const INITIAL_STATE: FormState = {
	name: "",
	domain: "",
	active: true,
};

export function CreateTenantFormDialog() {
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<FormState>(INITIAL_STATE);
	const [formError, setFormError] = useState<string | null>(null);

	const { mutate, isPending, error, isError } = useCreateTenant();

	function resetAndClose() {
		setForm(INITIAL_STATE);
		setFormError(null);
		setOpen(false);
	}

	function handleSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setFormError(null);

		if (!form.name.trim() || !form.domain.trim()) {
			setFormError("Nombre y dominio son obligatorios.");
			return;
		}

		mutate(
			{
				name: form.name.trim(),
				domain: form.domain.trim(),
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
				<Button>Nueva organización</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear organización</DialogTitle>
					<DialogDescription>
						Completa los datos para registrar un nuevo tenant.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							value={form.name}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, name: e.target.value }))
							}
							placeholder="Acme Corp"
							disabled={isPending}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="domain">Dominio</Label>
						<Input
							id="domain"
							value={form.domain}
							onChange={(e) =>
								setForm((prev) => ({ ...prev, domain: e.target.value }))
							}
							placeholder="acme.com"
							disabled={isPending}
						/>
					</div>

					<div className="flex items-center gap-2">
						<Checkbox
							id="active"
							checked={form.active}
							onCheckedChange={(checked) =>
								setForm((prev) => ({ ...prev, active: checked === true }))
							}
							disabled={isPending}
						/>
						<Label htmlFor="active">Activa</Label>
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
							{isPending ? "Creando..." : "Crear organización"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
