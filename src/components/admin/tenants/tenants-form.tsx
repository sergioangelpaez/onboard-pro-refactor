import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useUpdateTenant } from "#/hooks/tenants/use-update-tenant";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCreateTenant } from "@/hooks/tenants/use-create-tenant";
import {
	createTenantSchema,
	type Tenant,
	type TenantPayload,
} from "@/lib/schemas/tenants";

interface TenantFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tenant?: Tenant;
}

export function TenantFormSheet({
	open,
	onOpenChange,
	tenant,
}: TenantFormSheetProps) {
	const isEdit = !!tenant;
	const createTenant = useCreateTenant();
	const updateTenant = useUpdateTenant();
	const isPending = createTenant.isPending || updateTenant.isPending;

	const form = useForm({
		defaultValues: {
			name: tenant?.name ?? "",
			domain: tenant?.domain ?? "",
			active: tenant?.active ?? true,
		} as TenantPayload,
		validators: { onChange: createTenantSchema },
		onSubmit: ({ value }) => {
			const options = {
				onSuccess: () => {
					toast.success(
						isEdit ? "Organización actualizada" : "Organización creada",
						{
							description: isEdit
								? `Se actualizó la organización "${value.name}".`
								: `Se creó la organización "${value.name}".`,
						},
					);
					handleOpenChange(false);
				},
				onError: (error: Error) =>
					toast.error(
						isEdit
							? "No se pudo actualizar la organización"
							: "No se pudo crear la organización",
						{ description: error.message },
					),
			};

			if (isEdit && tenant) {
				updateTenant.mutate(
					{ id: tenant.id, payload: createTenantSchema.parse(value) },
					options,
				);
			} else {
				createTenant.mutate(createTenantSchema.parse(value), options);
			}
		},
	});

	function handleOpenChange(next: boolean) {
		onOpenChange(next);
		if (!next) form.reset();
	}

	return (
		<Sheet open={open} onOpenChange={handleOpenChange}>
			<SheetContent className="flex flex-col">
				<SheetHeader>
					<SheetTitle>
						{isEdit ? "Editar organización" : "Crear organización"}
					</SheetTitle>
					<SheetDescription>
						{isEdit
							? "Modifica los datos de la organización."
							: "Completa los datos para registrar una nueva organización."}
					</SheetDescription>
				</SheetHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex min-h-0 px-4 gap-4 flex-1 flex-col"
				>
					<ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:block!">
						<div className="grid gap-3">
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
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
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
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
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
						</div>
					</ScrollArea>

					<SheetFooter className="px-0">
						<form.Subscribe selector={(s) => s.canSubmit}>
							{(canSubmit) => (
								<Button type="submit" disabled={!canSubmit || isPending}>
									{isPending && <LoaderCircle className="animate-spin" />}
									{isEdit ? "Actualizar organización" : "Crear organización"}
								</Button>
							)}
						</form.Subscribe>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleOpenChange(false)}
							disabled={isPending}
						>
							Cancelar
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
