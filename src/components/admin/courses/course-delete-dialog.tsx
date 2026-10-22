import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import type { Course } from "#/lib/schemas/courses";
import { coursesService } from "#/lib/services/courses";
import { Button } from "../../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../ui/dialog";

interface CourseDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	course: Course;
}

export function CourseDeleteDialog({
	open,
	onOpenChange,
	course,
}: CourseDeleteDialogProps) {
	const isPending = false;

	function handleDelete() {
		coursesService.delete(course.id).then(() => {
			toast.success("Curso eliminado correctamente");
			onOpenChange(false);
		}).catch((error: Error) => {
			toast.error("No se pudo eliminar el curso", {
				description: error.message,
			});
		});
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Eliminar curso</DialogTitle>
					<DialogDescription>
						¿Estás seguro de que quieres eliminar el curso <strong>{course.name}</strong>?
						Esta acción quedará preparada para la API real cuando el endpoint esté disponible.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
						Cancelar
					</Button>
					<Button variant="destructive" onClick={handleDelete} disabled={isPending}>
						{isPending && <LoaderCircle className="animate-spin" />}
						Eliminar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
