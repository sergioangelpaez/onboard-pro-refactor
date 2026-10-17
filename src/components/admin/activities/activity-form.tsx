import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type z from "zod";
import { useCreateActivity } from "#/hooks/activities/use-create-activity";
import { useUpdateActivity } from "#/hooks/activities/use-update-activity";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useCourseSections } from "#/hooks/sections/use-course-sections";
import {
	type Activity,
	type ActivityFormValues,
	type CreateActivityPayload,
	createActivityFormSchema,
	updateActivityFormSchema,
} from "#/lib/schemas/activities";
import { Attachment } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "../../ui/sheet";

type ActivityType = CreateActivityPayload["type"];

const TYPE_OPTIONS: { value: ActivityType; label: string }[] = [
	{ value: "Recurso", label: "Recurso" },
	{ value: "Tarea", label: "Tarea" },
	{ value: "Examen", label: "Examen" },
];

interface ActivitySheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultCourseId?: string;
	defaultSectionId?: string;
	activity?: Activity;
}

export function ActivityFormSheet({
	open,
	onOpenChange,
	defaultCourseId,
	defaultSectionId,
	activity,
}: ActivitySheetProps) {
	const createActivity = useCreateActivity();
	const updateActivity = useUpdateActivity();
	const isEdit = !!activity;
	const isPending = createActivity.isPending || updateActivity.isPending;
	const [courseId, setCourseId] = useState(defaultCourseId ?? "");
	const courses = useAllCourses();
	const sections = useCourseSections(courseId);

	const form = useForm({
		defaultValues: {
			name: activity?.name ?? "",
			title: activity?.title ?? "",
			type: activity?.type ?? "Recurso",
			description: activity?.description ?? "",
			deliverable: activity?.deliverable ?? false,
			sectionId: activity?.sectionId ?? defaultSectionId ?? "",
			xp: activity?.xp ?? 0,
			archivo: null as unknown as File,
		} as ActivityFormValues,
		validators: {
			onChange: (isEdit
				? updateActivityFormSchema
				: createActivityFormSchema) as unknown as z.ZodType<
				ActivityFormValues,
				ActivityFormValues
			>,
		},
		onSubmit: ({ value }) => {
			if (activity) {
				updateActivity.mutate(
					{ id: activity.id, values: value },
					{
						onSuccess: () => {
							toast.success("Actividad actualizada");
							handleOpenChange(false);
						},
						onError: (e: Error) =>
							toast.error("No se pudo actualizar la actividad", {
								description: e.message,
							}),
					},
				);
				return;
			}

			createActivity.mutate(value, {
				onSuccess: () => {
					toast.success("Actividad creada");
					handleOpenChange(false);
				},
				onError: (e: Error) =>
					toast.error("No se pudo crear la actividad", {
						description: e.message,
					}),
			});
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
						{isEdit ? "Editar actividad" : "Crear actividad"}
					</SheetTitle>
					<SheetDescription>
						{isEdit
							? "Modifica los datos de la actividad."
							: "Completa los datos para registrar una nueva actividad."}
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
												placeholder="actividad-1"
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

							<form.Field name="title">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Título</FieldLabel>
											<Input
												id={field.name}
												placeholder="Introducción a las variables"
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
								<>
									<Field>
										<FieldLabel htmlFor="courseId">Curso</FieldLabel>
										<Select
											value={courseId}
											onValueChange={(value) => {
												setCourseId(value);
												form.setFieldValue("sectionId", "");
											}}
										>
											<SelectTrigger id="courseId" disabled={courses.isLoading}>
												<SelectValue
													placeholder={
														courses.isLoading
															? "Cargando cursos..."
															: "Selecciona un curso"
													}
												/>
											</SelectTrigger>
											<SelectContent>
												{courses.data?.map((course) => (
													<SelectItem key={course.id} value={course.id}>
														{course.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>

									<form.Field name="sectionId">
										{(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>Sección</FieldLabel>
													<Select
														value={field.state.value}
														onValueChange={field.handleChange}
														disabled={!courseId || sections.isLoading}
													>
														<SelectTrigger
															id={field.name}
															onBlur={field.handleBlur}
														>
															<SelectValue
																placeholder={
																	!courseId
																		? "Primero selecciona un curso"
																		: sections.isLoading
																			? "Cargando secciones..."
																			: "Selecciona una sección"
																}
															/>
														</SelectTrigger>
														<SelectContent>
															{sections.data?.map((section) => (
																<SelectItem key={section.id} value={section.id}>
																	{section.name}
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
								</>
							)}

							<form.Field name="type">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
											<Select
												value={field.state.value}
												onValueChange={
													field.handleChange as (value: ActivityType) => void
												}
											>
												<SelectTrigger
													id={field.name}
													onBlur={field.handleBlur}
												>
													<SelectValue placeholder="Selecciona un tipo" />
												</SelectTrigger>
												<SelectContent>
													{TYPE_OPTIONS.map((type) => (
														<SelectItem key={type.value} value={type.value}>
															{type.label}
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
								<form.Field name="xp">
									{(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>XP</FieldLabel>
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
							)}

							<form.Field name="description">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>Descripción</FieldLabel>
											<Textarea
												id={field.name}
												rows={4}
												placeholder="Describe la actividad..."
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

							<form.Field name="archivo">
								{(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									const file = field.state.value as File | null;

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												{isEdit
													? "Reemplazar archivo (opcional)"
													: "Archivo adjunto"}
											</FieldLabel>
											{isEdit && !file && (
												<FieldDescription>
													Archivo actual: {activity.adjunto.split("/").pop()}
												</FieldDescription>
											)}

											<Input
												id={field.name}
												type="file"
												accept="image/*,application/pdf,video/mp4,video/webm,video/quicktime"
												onBlur={field.handleBlur}
												onChange={(e) => {
													const selected = e.target.files?.[0];
													if (selected) field.handleChange(selected);
												}}
											/>

											{file && (
												<Attachment>
													<span>{file.name}</span>
													<span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															field.handleChange(null as unknown as File)
														}
													>
														Quitar
													</Button>
												</Attachment>
											)}

											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							</form.Field>

							<form.Field name="deliverable">
								{(field) => (
									<Field orientation="horizontal">
										<Checkbox
											id={field.name}
											checked={field.state.value}
											onCheckedChange={(checked) =>
												field.handleChange(checked === true)
											}
										/>
										<div className="grid gap-1">
											<FieldLabel htmlFor={field.name}>Entregable</FieldLabel>
											<FieldDescription>
												Los estudiantes deben enviar una entrega.
											</FieldDescription>
										</div>
									</Field>
								)}
							</form.Field>
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
									{isEdit ? "Guardar cambios" : "Crear actividad"}
								</Button>
							)}
						</form.Subscribe>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
