import { useForm } from "@tanstack/react-form";
import { Check, ChevronsUpDown, LoaderCircle, X } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useAddCourses } from "#/hooks/groups/use-add-courses";
import type { Group } from "@/lib/schemas/groups";
import { cn } from "@/lib/utils/utils";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "#/components/ui/command";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "#/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";

const addCoursesSchema = z.object({
	coursesIds: z.array(z.string()).min(1, "Selecciona al menos un curso"),
});

interface GroupAddCoursesDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	group: Group;
}

export function GroupAddCoursesDialog({
	open,
	onOpenChange,
	group,
}: GroupAddCoursesDialogProps) {
	const { data: courses = [], isLoading, error, refetch } = useAllCourses();
	const { mutate, isPending } = useAddCourses();

	const form = useForm({
		defaultValues: {
			coursesIds: [] as string[],
		},
		validators: { onChange: addCoursesSchema },
		onSubmit: ({ value }) =>
			mutate(
				{ id: group.id, coursesIds: value.coursesIds },
				{
					onSuccess: () => {
						toast.success("Cursos agregados correctamente");
						handleOpenChange(false);
					},
					onError: (e: Error) => {
						toast.error("No se pudieron agregar los cursos", {
							description: e.message,
						});
					},
				},
			),
	});

	function handleOpenChange(next: boolean) {
		onOpenChange(next);
		if (!next) form.reset();
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Agregar cursos</DialogTitle>
					<DialogDescription>
						Selecciona los cursos que deseas agregar al grupo {group.name}.
					</DialogDescription>
				</DialogHeader>

				<form
					id="group-add-courses-form"
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="flex flex-col gap-4"
				>
					<form.Field name="coursesIds">
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
									<FieldLabel>Cursos</FieldLabel>

									{error ? (
										<Button
											type="button"
											variant="outline"
											onClick={() => refetch()}
										>
											No se pudieron cargar los cursos. Reintentar
										</Button>
									) : (
										<Popover>
											<PopoverTrigger asChild>
												<Button
													type="button"
													variant="outline"
													role="combobox"
													className="justify-between font-normal"
													disabled={isLoading}
													onBlur={field.handleBlur}
												>
													{isLoading ? (
														<>
															Cargando cursos...
															<LoaderCircle className="animate-spin" />
														</>
													) : (
														<>
															{selected.length > 0
																? `${selected.length} seleccionado(s)`
																: "Selecciona cursos"}
															<ChevronsUpDown className="opacity-50" />
														</>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent
												className="w-(--radix-popover-trigger-width) p-0"
												align="start"
											>
												<Command>
													<CommandInput placeholder="Buscar curso..." />
													<CommandList>
														<CommandEmpty>
															No se encontraron cursos.
														</CommandEmpty>
														<CommandGroup>
															{courses.map((course) => (
																<CommandItem
																	key={course.id}
																	value={course.id}
																	keywords={[course.name]}
																	onSelect={() => toggle(course.id)}
																>
																	<Check
																		className={cn(
																			"mr-2 size-4",
																			selected.includes(course.id)
																				? "opacity-100"
																				: "opacity-0",
																		)}
																	/>
																	{course.name}
																</CommandItem>
															))}
														</CommandGroup>
													</CommandList>
												</Command>
											</PopoverContent>
										</Popover>
									)}

									{selected.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{selected.map((id) => (
												<Badge key={id} variant="secondary" className="gap-1">
													{courses.find((course) => course.id === id)?.name ??
														id}
													<button
														type="button"
														onClick={() => toggle(id)}
														aria-label="Quitar curso"
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
								form="group-add-courses-form"
								disabled={!canSubmit || isPending}
							>
								{isPending && <LoaderCircle className="animate-spin" />}
								Agregar cursos
							</Button>
						)}
					</form.Subscribe>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
