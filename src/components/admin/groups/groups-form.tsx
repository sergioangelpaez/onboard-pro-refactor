import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { useCreateGroup } from "@/hooks/groups/use-create-group";
import { useUpdateGroup } from "@/hooks/groups/use-update-group";
import { useAllUsers } from "@/hooks/users/use-all-users";
import {
	type CreateGroupPayload,
	createGroupSchema,
	type Group,
	type UpdateGroupPayload,
	updateGroupSchema,
} from "@/lib/schemas/groups";
import { cn } from "@/lib/utils/utils";

interface GroupFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group?: Group;
}

export function GroupFormSheet({
	open,
	onOpenChange,
	group,
}: GroupFormSheetProps) {
	const isEdit = !!group;
	const createGroup = useCreateGroup();
	const updateGroup = useUpdateGroup();
	const isPending = createGroup.isPending || updateGroup.isPending;
	const { data: users = [] } = useAllUsers();

	const form = useForm({
		defaultValues: {
			name: group?.name ?? "",
			description: group?.description ?? "",
			userIds: [],
		} as CreateGroupPayload | UpdateGroupPayload,
		validators: { onChange: isEdit ? updateGroupSchema : createGroupSchema },
		onSubmit: ({ value }) => {
			const options = {
				onSuccess: () => {
					toast.success(isEdit ? "Grupo actualizado" : "Grupo creado", {
						description: isEdit
							? `Se actualizó el grupo "${value.name}".`
							: `Se creó el grupo "${value.name}".`,
					});
					handleOpenChange(false);
				},
				onError: (error: Error) =>
					toast.error(
						isEdit
							? "No se pudo actualizar el grupo"
							: "No se pudo crear el grupo",
						{ description: error.message },
					),
			};

			if (isEdit && group) {
				updateGroup.mutate(
					{ id: group.id, payload: updateGroupSchema.parse(value) },
					options,
				);
			} else {
				createGroup.mutate(createGroupSchema.parse(value), options);
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
					<SheetTitle>{isEdit ? "Editar grupo" : "Crear grupo"}</SheetTitle>
					<SheetDescription>
						{isEdit
							? "Modifica los datos del grupo."
							: "Completa los datos para registrar un nuevo grupo."}
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

							<form.Field name="description">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
											<Input
												id={field.name}
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
								<form.Field name="userIds">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										const selected = field.state.value ?? [];

										function toggle(id: string) {
											field.handleChange(
												selected.includes(id)
													? selected.filter((value) => value !== id)
													: [...selected, id],
											);
										}

										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel>Miembros</FieldLabel>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															type="button"
															variant="outline"
															role="combobox"
															className="justify-between font-normal"
															onBlur={field.handleBlur}
														>
															{selected.length > 0
																? `${selected.length} seleccionado(s)`
																: "Selecciona usuarios"}
															<ChevronsUpDown className="opacity-50" />
														</Button>
													</PopoverTrigger>
													<PopoverContent
														className="w-(--radix-popover-trigger-width) p-0"
														align="start"
													>
														<Command>
															<CommandInput placeholder="Buscar usuario..." />
															<CommandList>
																<CommandEmpty>
																	No se encontraron usuarios.
																</CommandEmpty>
																<CommandGroup>
																	{users.map((user) => (
																		<CommandItem
																			key={user.id}
																			value={user.id}
																			keywords={[
																				`${user.firstname} ${user.lastname}`,
																				user.email,
																			]}
																			onSelect={() => toggle(user.id)}
																		>
																			<Check
																				className={cn(
																					"mr-2 size-4",
																					selected.includes(user.id)
																						? "opacity-100"
																						: "opacity-0",
																				)}
																			/>
																			{user.firstname} {user.lastname} -{" "}
																			{user.email}
																		</CommandItem>
																	))}
																</CommandGroup>
															</CommandList>
														</Command>
													</PopoverContent>
												</Popover>

												{selected.length > 0 && (
													<div className="flex flex-wrap gap-1">
														{selected.map((id) => (
															<Badge
																key={id}
																variant="secondary"
																className="gap-1"
															>
																{users.find((u) => u.id === id)?.firstname ??
																	id}
																<button
																	type="button"
																	onClick={() => toggle(id)}
																	aria-label="Quitar usuario"
																>
																	<X className="size-3" />
																</button>
															</Badge>
														))}
													</div>
												)}

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
									{isEdit ? "Actualizar grupo" : "Crear grupo"}
								</Button>
							)}
						</form.Subscribe>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
