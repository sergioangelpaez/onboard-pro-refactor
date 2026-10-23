import { useForm } from "@tanstack/react-form";
import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAchievementOptions } from "#/hooks/achievements/use-achievement-options";
import { useCreateAchievement } from "#/hooks/achievements/use-create-achievement";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import {
	type CreateAchievementPayload,
	createAchievementSchema,
	etiquetaCondicion,
	payloadDeLogro,
	SIN_CURSO,
	TODAS,
} from "#/lib/schemas/achievements";
import { rolReal } from "#/lib/utils/auth/session";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "../../ui/field";
import { Input } from "../../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";

export function CreateAchievementDialogForm() {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useCreateAchievement();
	const {
		data: options,
		isLoading: isOptionsLoading,
		error: optionsError,
	} = useAchievementOptions();
	const { user } = useCurrentUser();
	// Solo el superadmin crea logros para todas las organizaciones; el backend
	// le responde 403 a cualquier otro.
	const esSuper = rolReal(user?.role) === "superadmin";
	// Para el superadmin, la organización que eligió en el menú.
	const organizacion = useOrganizacionActiva();
	const { data: empresas = [] } = useAllTenants(esSuper);
	const nombreOrganizacion = esSuper
		? empresas.find((e) => e.id === organizacion)?.name
		: user?.tenantName;
	// El superadmin sin organización elegida solo puede crear genéricos: un
	// logro de organización o de curso necesita saber de cuál.
	const soloGenerico = esSuper && !organizacion;
	const iconoDeCategoria = new Map(
		(options?.categorias ?? []).map((c) => [c.nombre, c.icono]),
	);

	const form = useForm({
		defaultValues: {
			nombre: "",
			descripcion: "",
			tipoCondicion: "",
			meta: 1,
			xpRecompensa: 0,
			icono: "",
			cursoId: soloGenerico ? TODAS : SIN_CURSO,
		} as CreateAchievementPayload,
		validators: { onChange: createAchievementSchema },
		onSubmit: ({ value }) => {
			const datos = createAchievementSchema.parse(value);
			mutate(payloadDeLogro(datos, esSuper ? organizacion : null), {
				onSuccess: () => {
					toast.success("Logro creado", {
						description: `Se creó el logro "${value.nombre}".`,
					});
					handleOpenChange(false);
				},
				onError: (error) => {
					toast.error("Error al crear el logro", {
						description: error.message,
					});
				},
			});
		},
	});

	function handleOpenChange(next: boolean) {
		setOpen(next);
		if (!next) form.reset();
		// Al abrir, el alcance arranca según la organización elegida en ese
		// momento: pudo cambiar desde la última vez.
		if (next) form.setFieldValue("cursoId", soloGenerico ? TODAS : SIN_CURSO);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Crear logro
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear logro</DialogTitle>
					<DialogDescription>
						Completa los datos para registrar un nuevo logro.
					</DialogDescription>
				</DialogHeader>

				<form
					id="achievement-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field name="nombre">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
									<Input
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="descripcion">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
									<Textarea
										id={field.name}
										rows={3}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="tipoCondicion">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							const selectedCondition = options?.condiciones.find(
								(condition) => condition.tipoCondicion === field.state.value,
							);

							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>
										Tipo de condición
									</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
										disabled={isOptionsLoading || !!optionsError}
									>
										<SelectTrigger id={field.name} onBlur={field.handleBlur}>
											<SelectValue
												placeholder={
													isOptionsLoading
														? "Cargando condiciones..."
														: "Selecciona una condición"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{options?.condiciones.map((condition) => (
												<SelectItem
													key={condition.tipoCondicion}
													value={condition.tipoCondicion}
												>
													{iconoDeCategoria.get(condition.categoria) ?? ""}{" "}
													{etiquetaCondicion(condition.tipoCondicion)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{optionsError && (
										<FieldDescription>
											No se pudieron cargar las condiciones.
										</FieldDescription>
									)}
									{selectedCondition && (
										<FieldDescription>
											{selectedCondition.categoria &&
												`Categoría: ${selectedCondition.categoria}`}
											{selectedCondition.categoria &&
												selectedCondition.ejemplo &&
												" · "}
											{selectedCondition.ejemplo &&
												`Por ejemplo: ${selectedCondition.ejemplo}`}
										</FieldDescription>
									)}

									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Subscribe selector={(s) => s.values.tipoCondicion}>
						{(tipo) => {
							const categoria = options?.condiciones.find(
								(c) => c.tipoCondicion === tipo,
							)?.categoria;
							const porDefecto =
								(categoria && iconoDeCategoria.get(categoria)) ||
								options?.iconoGenerico ||
								"🏅";
							return (
								<form.Field name="icono">
									{(field) => (
										<Field>
											<FieldLabel htmlFor={field.name}>
												Ícono (opcional)
											</FieldLabel>
											<Input
												id={field.name}
												value={field.state.value}
												placeholder={porDefecto}
												maxLength={100}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
											/>
											<FieldDescription>
												Un emoji. Si lo dejas vacío se usa {porDefecto}.
											</FieldDescription>
										</Field>
									)}
								</form.Field>
							);
						}}
					</form.Subscribe>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<form.Field name="meta">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Meta</FieldLabel>
										<Input
											id={field.name}
											type="number"
											min={1}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>

						<form.Field name="xpRecompensa">
							{(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>XP recompensa</FieldLabel>
										<Input
											id={field.name}
											type="number"
											min={0}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						</form.Field>
					</div>

					<form.Field name="cursoId">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Alcance</FieldLabel>
									{/* Los logros cuentan lo que la persona hace en todos sus
									    cursos: no se atan a uno solo. */}
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
									>
										<SelectTrigger id={field.name} onBlur={field.handleBlur}>
											<SelectValue placeholder="Elige el alcance" />
										</SelectTrigger>
										<SelectContent>
											{esSuper && (
												<SelectItem value={TODAS}>
													🌐 Todas las organizaciones
												</SelectItem>
											)}
											{!soloGenerico && (
												<SelectItem value={SIN_CURSO}>
													🏢 Toda la organización
													{nombreOrganizacion ? `: ${nombreOrganizacion}` : ""}
												</SelectItem>
											)}
										</SelectContent>
									</Select>
									<FieldDescription>
										{soloGenerico
											? "Para crear un logro de una sola organización, elige primero la organización en el menú."
											: "Cuenta lo que la persona hace en todos sus cursos."}
									</FieldDescription>
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
								form="achievement-form"
								disabled={!canSubmit || isPending || isOptionsLoading}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Crear logro
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
