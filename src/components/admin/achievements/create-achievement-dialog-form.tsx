import { useForm } from "@tanstack/react-form";
import { LoaderCircle, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAchievementOptions } from "#/hooks/achievements/use-achievement-options";
import { useCreateAchievement } from "#/hooks/achievements/use-create-achievement";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import {
	type CreateAchievementPayload,
	createAchievementSchema,
} from "#/lib/schemas/achievements";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
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
	const { data: courses = [], isLoading: isCoursesLoading } = useAllCourses();

	const form = useForm({
		defaultValues: {
			nombre: "",
			descripcion: "",
			categoria: "",
			tipoCondicion: "",
			meta: 0,
			xpRecompensa: 0,
			cursoId: "",
			generico: false,
		} as CreateAchievementPayload,
		validators: { onChange: createAchievementSchema },
		onSubmit: ({ value }) => {
			mutate(createAchievementSchema.parse(value), {
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

					<form.Field name="categoria">
						{(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<FieldLabel htmlFor={field.name}>Categoría</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
										disabled={isOptionsLoading || !!optionsError}
									>
										<SelectTrigger id={field.name} onBlur={field.handleBlur}>
											<SelectValue
												placeholder={
													isOptionsLoading
														? "Cargando categorías..."
														: "Selecciona una categoría"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{options?.categorias.map((categoria) => (
												<SelectItem key={categoria} value={categoria}>
													{categoria}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{optionsError && (
										<FieldDescription>
											No se pudieron cargar las opciones de categorías.
										</FieldDescription>
									)}
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
									<FieldLabel htmlFor={field.name}>Tipo de condición</FieldLabel>
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
													{condition.tipoCondicion}
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{selectedCondition &&
										(selectedCondition.unidad || selectedCondition.ejemplo) && (
											<FieldDescription>
												{selectedCondition.unidad &&
													`Unidad: ${selectedCondition.unidad}`}
												{selectedCondition.unidad &&
													selectedCondition.ejemplo && " | "}
												{selectedCondition.ejemplo &&
													`Ejemplo: ${selectedCondition.ejemplo}`}
											</FieldDescription>
										)}

									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

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
											min={0}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) =>
												field.handleChange(Number(e.target.value))
											}
										/>
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
										{isInvalid && <FieldError errors={field.state.meta.errors} />}
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
									<FieldLabel htmlFor={field.name}>Curso</FieldLabel>
									<Select
										value={field.state.value}
										onValueChange={field.handleChange}
										disabled={isCoursesLoading}
									>
										<SelectTrigger id={field.name} onBlur={field.handleBlur}>
											<SelectValue
												placeholder={
													isCoursesLoading
														? "Cargando cursos..."
														: "Selecciona un curso"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{courses.map((course) => (
												<SelectItem key={course.id} value={course.id}>
													{course.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					</form.Field>

					<form.Field name="generico">
						{(field) => (
							<Field orientation="horizontal">
								<Checkbox
									id={field.name}
									checked={field.state.value}
									onCheckedChange={(checked) =>
										field.handleChange(checked === true)
									}
								/>
								<FieldLabel htmlFor={field.name}>Logro genérico</FieldLabel>
							</Field>
						)}
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