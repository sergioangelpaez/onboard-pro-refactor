import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown, LoaderCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAllActivities } from "#/hooks/activities/use-all-activities";
import { useCreateCourse } from "#/hooks/courses/use-create-course";
import {
	type CreateCoursePayload,
	createCourseSchema,
} from "@/lib/schemas/courses";
import { cn } from "@/lib/utils/utils";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "../../ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../../ui/dialog";
import { Field, FieldError, FieldLabel } from "../../ui/field";
import { Input } from "../../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";

export function CreateCourseDialogForm() {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useCreateCourse();
	const { data: activities = [] } = useAllActivities();

	const form = useForm({
		defaultValues: {
			name: "",
			instructor: "",
			grupo: "",
			status: "",
			actividades: [],
		} as CreateCoursePayload,
		validators: { onChange: createCourseSchema },
		onSubmit: ({ value }) =>
			mutate(value, {
				onSuccess: () => {
					toast.success("Curso creado", {
						description: `Se creó el curso "${value.name}".`,
					});
					handleOpenChange(false);
				},
				onError: (error) => {
					toast.error("Error al crear el curso", {
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button>
					<Plus />
					Crear Curso
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Crear curso</DialogTitle>
					<DialogDescription>
						Completa los datos para registrar un nuevo curso.
					</DialogDescription>
				</DialogHeader>
				<form
					id="course-form"
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

					<form.Field name="instructor">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="instructor">Instructor</FieldLabel>
									<Input
										id={field.name}
										type="email"
										placeholder="instructor@empresa.com"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="grupo">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="grupo">Grupo</FieldLabel>
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

					<form.Field name="status">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor="status">Estado</FieldLabel>
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

					<form.Field name="actividades">
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
									<FieldLabel>Actividades</FieldLabel>
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
													? `${selected.length} seleccionada(s)`
													: "Selecciona actividades"}
												<ChevronsUpDown className="opacity-50" />
											</Button>
										</PopoverTrigger>
										<PopoverContent
											className="w-(--radix-popover-trigger-width) p-0"
											align="start"
										>
											<Command>
												<CommandInput placeholder="Buscar actividad..." />
												<CommandList>
													<CommandEmpty>
														No se encontraron actividades.
													</CommandEmpty>
													<CommandGroup>
														{activities.map((activity) => (
															<CommandItem
																key={activity.id}
																value={activity.id}
																keywords={[activity.title, activity.name]}
																onSelect={() => toggle(activity.id)}
															>
																<Check
																	className={cn(
																		"mr-2 size-4",
																		selected.includes(activity.id)
																			? "opacity-100"
																			: "opacity-0",
																	)}
																/>
																{activity.title}
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
													{activities.find((activity) => activity.id === id)
														?.title ?? id}
													<button
														type="button"
														onClick={() => toggle(id)}
														aria-label="Quitar actividad"
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
								form="course-form"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Crear curso
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
