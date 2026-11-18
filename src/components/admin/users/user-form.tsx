import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useCreateUser } from "#/hooks/users/use-create-user";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";
import { useUpdateUser } from "#/hooks/users/use-update-user";
import {
	type CreateUserPayload,
	type UpdateUserPayload,
	type User,
	updateUserSchema,
	userPayloadSchema,
} from "#/lib/schemas/users";
import { PasswordField } from "@/components/shared/form/password-field";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { ETIQUETA_ROL } from "./etiquetas";

// El backend solo acepta estos dos estados.
type Status = "Active" | "Inactive";

type Role = "student" | "admin" | "instructor";

// Lo que puede asignar el administrador de una organización. Superadmin no
// está: es de la plataforma y no se crea desde aquí.
const ROLE_OPTIONS: { value: Role; label: string }[] = (
	["student", "instructor", "admin"] as const
).map((value) => ({ value, label: ETIQUETA_ROL[value] }));

// El superadministrador solo da de alta al administrador de la organización.
const ROLE_OPTIONS_SUPER = ROLE_OPTIONS.filter((r) => r.value === "admin");

const STATUS_OPTIONS: { value: Status; label: string }[] = [
	{ value: "Active", label: "Activo" },
	{ value: "Inactive", label: "Inactivo" },
];

interface UserFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user?: User;
}

export function UserFormSheet({
	open,
	onOpenChange,
	user,
}: UserFormSheetProps) {
	const isEdit = !!user;
	const createUser = useCreateUser();
	const updateUser = useUpdateUser();
	const isPending = createUser.isPending || updateUser.isPending;
	const esSuper = useSoloLectura();
	const organizacion = useOrganizacionActiva();
	const roles = esSuper ? ROLE_OPTIONS_SUPER : ROLE_OPTIONS;
	// El superadmin no pertenece a ninguna organización: elige en cuál crea al
	// administrador. Arranca con la que tenga activa en el menú, si hay una.
	const pideOrganizacion = esSuper && !isEdit;
	const organizaciones = useAllTenants(pideOrganizacion);
	const [orgElegida, setOrgElegida] = useState<string>(organizacion ?? "");
	useEffect(() => {
		if (open) setOrgElegida(organizacion ?? "");
	}, [open, organizacion]);
	const faltaOrganizacion = pideOrganizacion && !orgElegida;

	const form = useForm({
		defaultValues: {
			email: user?.email ?? "",
			firstname: user?.firstname ?? "",
			lastname: user?.lastname ?? "",
			phonumber: user?.phonumber ?? "",
			role: esSuper ? "admin" : ((user?.role as Role | undefined) ?? "student"),
			status: user?.status ?? "Active",
		} as UpdateUserPayload | CreateUserPayload,
		validators: { onChange: isEdit ? updateUserSchema : userPayloadSchema },
		onSubmit: ({ value }) => {
			const options = {
				onSuccess: () => {
					toast.success(isEdit ? "Usuario actualizado" : "Usuario creado");
					handleOpenChange(false);
				},
				onError: (e: Error) =>
					toast.error(
						isEdit
							? "No se pudo actualizar el usuario"
							: "No se pudo crear el usuario",
						{ description: e.message },
					),
			};

			if (isEdit && user) {
				updateUser.mutate(
					{ id: user.id, payload: value as UpdateUserPayload },
					options,
				);
			} else {
				createUser.mutate(
					{
						...(value as CreateUserPayload),
						...(pideOrganizacion ? { tenantId: orgElegida } : {}),
					},
					options,
				);
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
					<SheetTitle>{isEdit ? "Editar usuario" : "Crear usuario"}</SheetTitle>
					<SheetDescription>
						{isEdit
							? "Modifica los datos del usuario."
							: esSuper
								? "Registra al administrador de la organización: desde su cuenta se gestiona el resto."
								: "Completa los datos para registrar un nuevo usuario."}
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
							{pideOrganizacion && (
								<Field data-invalid={faltaOrganizacion}>
									<FieldLabel htmlFor="organizacion">Organización</FieldLabel>
									<Select value={orgElegida} onValueChange={setOrgElegida}>
										<SelectTrigger id="organizacion">
											<SelectValue
												placeholder={
													organizaciones.isLoading
														? "Cargando organizaciones..."
														: "Selecciona la organización"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{(organizaciones.data ?? [])
												.filter((o) => o.active !== false)
												.map((o) => (
													<SelectItem key={o.id} value={o.id}>
														{o.name}
													</SelectItem>
												))}
										</SelectContent>
									</Select>
								</Field>
							)}

							<form.Field name="firstname">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Nombre</FieldLabel>
											<Input
												id={field.name}
												placeholder="Juan"
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

							<form.Field name="lastname">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Apellido</FieldLabel>
											<Input
												id={field.name}
												placeholder="Pérez"
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
							<form.Field name="email">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Email</FieldLabel>
											<Input
												id={field.name}
												type="email"
												autoComplete="off"
												placeholder="juan.perez@empresa.com"
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

							<form.Field name="phonumber">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
											<Input
												id={field.name}
												type="tel"
												placeholder="300 123 4567"
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

							{!isEdit && (
								<form.Field name="password">
									{(field) => (
										<PasswordField
											field={field}
											label="Contraseña temporal"
											autoComplete="new-password"
											description="La persona tendrá que cambiarla en su primer ingreso."
										/>
									)}
								</form.Field>
							)}

							<form.Field name="role">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Rol</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={(v) => field.handleChange(v as Role)}
												// Con una sola opción no hay nada que elegir.
												disabled={roles.length === 1}
											>
												<SelectTrigger
													id={field.name}
													onBlur={field.handleBlur}
												>
													<SelectValue placeholder="Selecciona un rol" />
												</SelectTrigger>
												<SelectContent>
													{roles.map((role) => (
														<SelectItem key={role.value} value={role.value}>
															{role.label}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							{isEdit && (
								<form.Field name="status">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Estado</FieldLabel>
												<Select
													value={field.state.value}
													onValueChange={
														field.handleChange as (value: Status) => void
													}
												>
													<SelectTrigger
														id={field.name}
														onBlur={field.handleBlur}
													>
														<SelectValue placeholder="Selecciona un estado" />
													</SelectTrigger>
													<SelectContent>
														{STATUS_OPTIONS.map((status) => (
															<SelectItem
																key={status.value}
																value={status.value}
															>
																{status.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>
							)}

						</div>
					</ScrollArea>

					{faltaOrganizacion && (
						<p className="text-muted-foreground text-sm">
							Elige la organización del administrador.
						</p>
					)}
					<SheetFooter className="px-0">
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
									disabled={!canSubmit || isPending || faltaOrganizacion}
								>
									{isPending && <LoaderCircle className="animate-spin" />}
									{isEdit ? "Actualizar usuario" : "Crear usuario"}
								</Button>
							)}
						</form.Subscribe>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
