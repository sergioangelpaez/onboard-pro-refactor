import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown, LoaderCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateGroup } from "#/hooks/groups/use-create-groups";
import { useAllUsers } from "#/hooks/users/use-all-users";
import {
	type CreateGroupPayload,
	createGroupSchema,
} from "#/lib/schemas/groups";
import { cn } from "@/lib/utils/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export function CreateGroupDialogForm() {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useCreateGroup();
	const { data: users = [] } = useAllUsers();

	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			userIds: [],
		} as CreateGroupPayload,
		validators: { onChange: createGroupSchema },
		onSubmit: ({ value }) =>
			mutate(createGroupSchema.parse(value), {
				onSuccess: () => {
					toast.success("Grupo creado", {
						description: `Se creó el grupo "${value.name}".`,
					});
					handleOpenChange(false);
				},
				onError: (error) => {
					toast.error("Error al crear el grupo", {
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
				<Button>
					<Plus />
					Crear Grupo
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear grupo</DialogTitle>
					<DialogDescription>
						Completa los datos para registrar un nuevo grupo.
					</DialogDescription>
				</DialogHeader>
				<form
					id="group-form"
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
									<FieldLabel htmlFor="name">Nombre</FieldLabel>
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

					<form.Field name="description">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="description">Descripción</FieldLabel>
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

					<form.Field name="userIds">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							const selected = field.state.value;

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
																	user.firstname + " " + user.lastname,
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
																{user.firstname + " " + user.lastname} -{" "}
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
												<Badge key={id} variant="secondary" className="gap-1">
													{users.find((user) => user.id === id)?.firstname ??
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
								form="group-form"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Crear grupo
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
