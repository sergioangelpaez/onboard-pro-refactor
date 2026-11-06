import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type z from "zod";
import { useCreateActivity } from "#/hooks/activities/use-create-activity";
import { useReglasXp } from "#/hooks/activities/use-reglas-xp";
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
import { rangoDe } from "#/lib/utils/reglas-xp";
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
	const reglas = useReglasXp();

	const form = useForm({
		defaultValues: {
			name: activity?.name ?? "",
			title: activity?.title ?? "",
			type: activity?.type ?? "Recurso",
			description: activity?.description ?? "",
			deliverable: activity?.deliverable ?? false,
			sectionId: activity?.sectionId ?? defaultSectionId ?? "",
			xp: activity?.xp ?? rangoDe(activity?.type ?? "Recurso").recomendado,
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
												onValueChange={(valor: ActivityType) => {
													// Si el XP era el recomendado del tipo anterior (o
													// no entra en el rango nuevo), pasa al del nuevo.
													const anterior = rangoDe(field.state.value, reglas);
													const nuevo = rangoDe(valor, reglas);
													const xp = form.getFieldValue("xp");
													if (
														xp === anterior.recomendado ||
														xp < nuevo.minimo ||
														xp > nuevo.maximo
													) {
														form.setFieldValue("xp", nuevo.recomendado);
													}
													field.handleChange(valor);
												}}
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

							<form.Field
								name="xp"
								validators={{
									onChangeListenTo: ["type"],
									onChange: ({ value, fieldApi }) => {
										const r = rangoDe(
											fieldApi.form.getFieldValue("type"),
											reglas,
										);
										return Number.isInteger(value) &&
											value >= r.minimo &&
											value <= r.maximo
											? undefined
											: `Tiene que estar entre ${r.minimo} y ${r.maximo} XP`;
									},
								}}
							>
								{(field) => {
									const rango = rangoDe(form.getFieldValue("type"), reglas);
									const errores = field.state.meta.errors.filter(Boolean);
									const isInvalid = errores.length > 0;
									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>XP que otorga</FieldLabel>
											<div className="flex items-center gap-2">
												<Input
													id={field.name}
													type="number"
													min={rango.minimo}
													max={rango.maximo}
													step={1}
													className="w-28"
													value={Number.isNaN(field.state.value) ? "" : field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) =>
														field.handleChange(e.target.valueAsNumber)
													}
												/>
												{field.state.value !== rango.recomendado && (
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() => field.handleChange(rango.recomendado)}
													>
														Usar recomendado ({rango.recomendado})
													</Button>
												)}
											</div>
											<FieldDescription>
												Entre {rango.minimo} y {rango.maximo} XP · recomendado{" "}
												{rango.recomendado}. Los niveles siguen una curva fija:
												el rango mantiene el progreso parejo entre cursos.
											</FieldDescription>
											{isInvalid && (
												<p className="text-destructive text-sm">
													{String(errores[0])}
												</p>
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
									const esExamen = form.getFieldValue("type") === "Examen";

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel htmlFor={field.name}>
												{isEdit
													? "Reemplazar archivo (opcional)"
													: esExamen
														? "Archivo adjunto (opcional)"
														: "Archivo adjunto"}
											</FieldLabel>
											{!isEdit && esExamen && (
												<FieldDescription>
													Los exámenes se configuran con preguntas y opciones
													después de crear la actividad. No necesitas adjuntar
													un archivo.
												</FieldDescription>
											)}
											{isEdit && !file && activity.adjunto && (
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
