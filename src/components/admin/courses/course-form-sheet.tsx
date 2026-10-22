import { useForm } from "@tanstack/react-form";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAllActivities } from "#/hooks/activities/use-all-activities";
import type { Course, CreateCoursePayload } from "#/lib/schemas/courses";
import { createCourseSchema } from "#/lib/schemas/courses";
import { coursesService } from "#/lib/services/courses";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";
import {
	Field,
	FieldError,
	FieldLabel,
} from "../../ui/field";
import { Input } from "../../ui/input";
import { ScrollArea } from "../../ui/scroll-area";

interface CourseFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	course?: Course;
}

export function CourseFormSheet({
	open,
	onOpenChange,
	course,
}: CourseFormSheetProps) {
	const { data: activities = [] } = useAllActivities();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const isEdit = !!course;

	const form = useForm({
		defaultValues: {
			name: course?.name ?? "",
			instructor: course?.instructor ?? "",
			grupo: course?.status ?? "",
			status: course?.status ?? "",
			actividades: course?.actividades ?? [],
		} as CreateCoursePayload,
		validators: { onChange: createCourseSchema },
		onSubmit: ({ value }) => {
			setIsSubmitting(true);
			const payload = createCourseSchema.parse(value);
			const action = isEdit && course
				? coursesService.update(course.id, payload)
				: coursesService.create(payload);

			action
				.then(() => {
					toast.success(isEdit ? "Curso actualizado" : "Curso creado", {
						description: isEdit
							? `Se actualizó el curso "${value.name}".`
							: `Se creó el curso "${value.name}".`,
					});
					onOpenChange(false);
				})
				.catch((error: Error) => {
					toast.error(
						isEdit ? "No se pudo actualizar el curso" : "No se pudo crear el curso",
						{ description: error.message },
					);
				})
				.finally(() => setIsSubmitting(false));
		},
	});

	function handleOpenChange(next: boolean) {
		onOpenChange(next);
		if (!next) form.reset();
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Editar curso" : "Crear curso"}</DialogTitle>
					<DialogDescription>
						{isEdit
							? "Modifica los datos de este curso."
							: "Completa los datos para registrar un nuevo curso."}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<ScrollArea className="max-h-[65vh]">
						<div className="grid gap-4">
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
											<FieldLabel htmlFor={field.name}>Instructor</FieldLabel>
											<Input
												id={field.name}
												type="email"
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
											<FieldLabel htmlFor={field.name}>Grupo</FieldLabel>
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
											<FieldLabel htmlFor={field.name}>Estado</FieldLabel>
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
									const selected = field.state.value;
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									const toggle = (id: string) => {
										field.handleChange(
											selected.includes(id)
												? selected.filter((value) => value !== id)
												: [...selected, id],
										);
									};

									return (
										<Field data-invalid={isInvalid}>
											<FieldLabel>Actividades</FieldLabel>
											<div className="flex flex-wrap gap-2">
												{activities.map((activity) => {
													const active = selected.includes(activity.id);
													return (
														<Badge
															key={activity.id}
															variant={active ? "default" : "secondary"}
															className="cursor-pointer"
															onClick={() => toggle(activity.id)}
														>
															{activity.title}
														</Badge>
													);
												})}
											</div>
											{isInvalid && <FieldError errors={field.state.meta.errors} />}
										</Field>
									);
								}}
							</form.Field>
						</div>
					</ScrollArea>
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={isSubmitting}
					>
						Cancelar
					</Button>
					<form.Subscribe selector={(s) => s.canSubmit}>
						{(canSubmit) => (
							<Button
								type="submit"
								disabled={!canSubmit || isSubmitting}
								onClick={() => form.handleSubmit()}
							>
								{isSubmitting && <LoaderCircle className="animate-spin" />}
								{isEdit ? "Guardar cambios" : "Crear curso"}
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
