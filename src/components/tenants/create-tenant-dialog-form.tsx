import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
	type CreateTenantPayload,
	createTenantSchema,
} from "#/lib/schemas/tenants";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useCreateTenant } from "@/hooks/tenants/use-create-tenant";

export function CreateTenantDialogForm() {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useCreateTenant();

	const form = useForm({
		defaultValues: {
			name: "",
			domain: "",
			active: true,
		} as CreateTenantPayload,
		validators: { onChange: createTenantSchema },
		onSubmit: ({ value }) =>
			mutate(value, {
				onSuccess: () => {
					toast.success("Organización creada", {
						description: `Se creó la organización "${value.name}".`,
					});
					handleOpenChange(false);
				},
				onError: (error) => {
					toast.error("Error al crear la organización", {
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
				<Button>Nueva organización</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear organización</DialogTitle>
					<DialogDescription>
						Completa los datos para registrar una nueva organización.
					</DialogDescription>
				</DialogHeader>

				<form
					id="create-organization-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field name="name">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
									<Input
										id={field.name}
										placeholder="Acme Corp"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="domain">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Dominio</FieldLabel>
									<Input
										id={field.name}
										placeholder="acme.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="active">
						{(field) => (
							<Field orientation="horizontal">
								<Checkbox
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) =>
										field.handleChange(checked === true)
									}
								/>
								<FieldLabel htmlFor={field.name}>Activa</FieldLabel>
							</Field>
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
								form="create-organization-form"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								{isPending ? "Creando..." : "Crear organización"}
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
