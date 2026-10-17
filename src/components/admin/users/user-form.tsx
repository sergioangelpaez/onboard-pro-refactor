import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { useCreateUser } from "#/hooks/users/use-create-user";
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
} from "../../ui/sheet";

type Status = "Active" | "Inactive" | "Pending" | "Suspended";

type Role = "student" | "admin" | "instructor" | "superadmin";

const ROLE_OPTIONS: { value: Role; label: string }[] = [
	{ value: "student", label: "Estudiante" },
	{ value: "admin", label: "Administrador" },
	{ value: "instructor", label: "Instructor" },
	{ value: "superadmin", label: "Super Administrador" },
];

const STATUS_OPTIONS: { value: Status; label: string }[] = [
	{ value: "Active", label: "Activo" },
	{ value: "Inactive", label: "Inactivo" },
	{ value: "Pending", label: "Pendiente" },
	{ value: "Suspended", label: "Suspendido" },
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

	const form = useForm({
		defaultValues: {
			email: user?.email ?? "",
			firstname: user?.firstname ?? "",
			lastname: user?.lastname ?? "",
			phonumber: user?.phonumber ?? "",
			role: user?.role ?? "student",
			status: user?.status ?? "Active",
			level: user?.level ?? 0,
			xp: user?.xp ?? 0,
			streak: user?.streak ?? 0,
			average: user?.average ?? 0,
			missions: user?.missions ?? "",
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
				createUser.mutate(value as CreateUserPayload, options);
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
												placeholder="juan@ucentral.edu.co"
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
											label="Contraseña"
											autoComplete="new-password"
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
												onValueChange={field.handleChange}
											>
												<SelectTrigger
													id={field.name}
													onBlur={field.handleBlur}
												>
													<SelectValue placeholder="Selecciona un rol" />
												</SelectTrigger>
												<SelectContent>
													{ROLE_OPTIONS.map((role) => (
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

							<div className="grid grid-cols-2 grid-rows-auto gap-4">
								<form.Field name="xp">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>
													Experiencia
												</FieldLabel>
												<Input
													id={field.name}
													type="number"
													min={0}
													placeholder="0"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(e.target.valueAsNumber || 0)
													}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="level">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Nivel</FieldLabel>
												<Input
													id={field.name}
													type="number"
													min={0}
													placeholder="0"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(e.target.valueAsNumber || 0)
													}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="streak">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Racha</FieldLabel>
												<Input
													id={field.name}
													type="number"
													min={0}
													placeholder="0"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(e.target.valueAsNumber || 0)
													}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="average">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Promedio</FieldLabel>
												<Input
													id={field.name}
													type="number"
													min={0}
													placeholder="0"
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(e.target.valueAsNumber || 0)
													}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								</form.Field>

								<form.Field name="missions">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Misiones</FieldLabel>
												<Input
													id={field.name}
													min={0}
													placeholder="0"
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
							</div>
						</div>
					</ScrollArea>

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
								<Button type="submit" disabled={!canSubmit || isPending}>
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
