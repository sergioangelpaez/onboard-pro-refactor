import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type {
	Course,
	CourseFormValues,
	UpdateCoursePayload,
} from "#/lib/schemas/courses";
import { courseFormSchema } from "#/lib/schemas/courses";
import { coursesService } from "#/lib/services/courses";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";
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
	FieldDescription,
	FieldError,
	FieldLabel,
} from "../../ui/field";
import { Input } from "../../ui/input";
import {
	EstadoSelect,
	GruposMultiSelect,
	InstructorSelect,
	ParaTodosCampo,
} from "./course-fields";

interface CourseFormSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	course: Course;
}

/**
 * Editar un curso (HU-028).
 *
 * Solo se manda lo que cambió: el backend valida cada campo por separado (un
 * instructor que no es de la organización, publicar un curso sin actividades)
 * y un cambio que no se tocó no debería poder fallar.
 *
 * Antes este formulario no llamaba al backend: mostraba "Curso actualizado"
 * sin guardar nada.
 */
export function CourseFormSheet({
	open,
	onOpenChange,
	course,
}: CourseFormSheetProps) {
	const queryClient = useQueryClient();
	const [guardando, setGuardando] = useState(false);

	const form = useForm({
		defaultValues: {
			name: course.name,
			instructor: course.instructor ?? "",
			status: course.status === "Abierto" ? "Abierto" : "Cerrado",
			grupoIds: [],
			paraTodos: Boolean(course.paraTodos),
			actividades: [],
		} as CourseFormValues,
		validators: { onChange: courseFormSchema },
		onSubmit: async ({ value }) => {
			const cambios: UpdateCoursePayload = {};
			if (value.name.trim() !== course.name) cambios.name = value.name.trim();
			if (value.status !== course.status) cambios.status = value.status;
			if (value.paraTodos !== Boolean(course.paraTodos))
				cambios.paraTodos = value.paraTodos;
			const cambioInstructor = value.instructor !== course.instructor;
			const asignar = value.grupoIds.length > 0;

			if (!Object.keys(cambios).length && !cambioInstructor && !asignar) {
				toast.info("No cambiaste nada.");
				return;
			}

			setGuardando(true);
			try {
				if (Object.keys(cambios).length)
					await coursesService.update(course.id, cambios);
				if (cambioInstructor)
					await coursesService.changeInstructor(course.id, value.instructor);
				if (asignar)
					await Promise.all(
						value.grupoIds.map((g) => groupsService.addCourses(g, [course.id])),
					);
				toast.success("Curso actualizado", {
					description: `Se guardaron los cambios de "${value.name.trim()}".`,
				});
				queryClient.invalidateQueries({ queryKey: ["courses"] });
				if (asignar)
					queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
				onOpenChange(false);
			} catch (error) {
				toast.error("No se pudo actualizar el curso", {
					description: (error as Error).message,
				});
			} finally {
				setGuardando(false);
			}
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
					<DialogTitle>Editar curso</DialogTitle>
					<DialogDescription>
						Modifica los datos de este curso.
					</DialogDescription>
				</DialogHeader>
				<form
					id={`course-edit-${course.id}`}
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
									<InstructorSelect
										id={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={field.handleChange}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="status">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>Estado</FieldLabel>
								<EstadoSelect
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
								/>
								<FieldDescription>
									Un curso sin actividades no se puede publicar.
								</FieldDescription>
							</Field>
						)}
					</form.Field>

					<form.Field name="paraTodos">
						{(field) => (
							<ParaTodosCampo
								id={field.name}
								value={field.state.value}
								onChange={field.handleChange}
							/>
						)}
					</form.Field>

					<form.Field name="grupoIds">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={field.name}>
									Asignar a más grupos
								</FieldLabel>
								<GruposMultiSelect
									id={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={field.handleChange}
									cursoId={course.id}
								/>
								<FieldDescription>
									Los grupos que ya lo tienen aparecen marcados. Para quitárselo
									a un grupo, hazlo desde Grupos.
								</FieldDescription>
							</Field>
						)}
					</form.Field>
				</form>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={guardando}
					>
						Cancelar
					</Button>
					<form.Subscribe selector={(s) => s.canSubmit}>
						{(canSubmit) => (
							<Button
								type="submit"
								form={`course-edit-${course.id}`}
								disabled={!canSubmit || guardando}
							>
								{guardando && <LoaderCircle className="animate-spin" />}
								Guardar cambios
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
