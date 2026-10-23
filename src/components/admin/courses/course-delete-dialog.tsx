import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Archive,
	ArchiveRestore,
	LoaderCircle,
	Trash,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import type { Course } from "#/lib/schemas/courses";
import { coursesService } from "#/lib/services/courses";
import { rolReal } from "#/lib/utils/auth/session";
import { Button } from "../../ui/button";
import { Checkbox } from "../../ui/checkbox";
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

/**
 * Retirar un curso (HU-029).
 *
 * Antes de decidir se muestra a quién afecta: cuántos aprendices lo tienen
 * asignado y cuánto contenido y progreso tiene. Se ofrecen dos salidas:
 *
 *   Archivar  -> lo recomendado. Desaparece para los aprendices pero se
 *                conserva todo, y se puede deshacer.
 *   Eliminar  -> para siempre, con sus archivos. Solo administradores, y pide
 *                confirmar explícitamente.
 */
export function CourseDeleteDialog({
	open,
	onOpenChange,
	course,
}: CourseDeleteDialogProps) {
	const queryClient = useQueryClient();
	const { user } = useCurrentUser();
	const puedeBorrar = ["admin", "superadmin"].includes(rolReal(user?.role));
	const [confirmado, setConfirmado] = useState(false);

	const impacto = useQuery({
		queryKey: ["courses", course.id, "impacto"],
		queryFn: () => coursesService.impact(course.id),
		enabled: open,
	});

	const refrescar = () =>
		queryClient.invalidateQueries({ queryKey: ["courses"] });
	const cerrar = (abierto: boolean) => {
		onOpenChange(abierto);
		if (!abierto) setConfirmado(false);
	};

	const archivar = useMutation({
		mutationFn: (archivado: boolean) =>
			coursesService.archive(course.id, archivado),
		onSuccess: (r) => {
			toast.success(r.message);
			refrescar();
			cerrar(false);
		},
		onError: (e: Error) =>
			toast.error("No se pudo archivar el curso", { description: e.message }),
	});

	const eliminar = useMutation({
		mutationFn: () => coursesService.delete(course.id),
		onSuccess: (r) => {
			toast.success(r.message, {
				description: `Se borraron ${r.actividades} actividades y ${r.archivosBorrados} archivos.`,
			});
			refrescar();
			cerrar(false);
		},
		onError: (e: Error) =>
			toast.error("No se pudo eliminar el curso", { description: e.message }),
	});

	const ocupado = archivar.isPending || eliminar.isPending;
	const i = impacto.data;

	return (
		<Dialog open={open} onOpenChange={cerrar}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{course.archivado ? "Curso archivado" : "Retirar curso"}:{" "}
						{course.name}
					</DialogTitle>
					<DialogDescription>
						{course.archivado
							? "Este curso está archivado: los aprendices no lo ven, pero se conserva todo su progreso."
							: "Archivarlo lo saca del catálogo y de los aprendices sin perder nada. Eliminarlo lo borra para siempre."}
					</DialogDescription>
				</DialogHeader>

				{impacto.isLoading && (
					<p className="flex items-center gap-2 text-muted-foreground text-sm">
						<LoaderCircle className="size-4 animate-spin" />
						Revisando a quién afecta...
					</p>
				)}

				{i && (
					<div className="space-y-2 rounded-md border p-3 text-sm">
						<p className="flex items-center gap-2 font-medium">
							<Users className="size-4" />
							{i.aprendices === 0
								? "Ningún aprendiz lo tiene asignado."
								: `${i.aprendices} ${i.aprendices === 1 ? "aprendiz lo tiene asignado" : "aprendices lo tienen asignado"}${i.grupos ? ` en ${i.grupos} ${i.grupos === 1 ? "grupo" : "grupos"}` : ""}.`}
						</p>
						<p className="text-muted-foreground">
							{i.secciones} secciones · {i.actividades} actividades ·{" "}
							{i.entregas} entregas · {i.intentosDeExamen} intentos de examen ·{" "}
							{i.actividadesCompletadas} actividades completadas por la gente
						</p>
					</div>
				)}

				{puedeBorrar && (
					<div className="flex items-start gap-2 text-sm">
						<Checkbox
							id={`confirmar-borrado-${course.id}`}
							checked={confirmado}
							onCheckedChange={(v) => setConfirmado(v === true)}
							className="mt-0.5"
						/>
						<label htmlFor={`confirmar-borrado-${course.id}`}>
							Entiendo que eliminar borra el curso, su contenido, las entregas y
							todos sus archivos, y que no se puede deshacer. El XP que la gente
							ganó se conserva.
						</label>
					</div>
				)}

				<DialogFooter className="gap-2 sm:justify-between">
					{puedeBorrar ? (
						<Button
							variant="destructive"
							onClick={() => eliminar.mutate()}
							disabled={!confirmado || ocupado}
						>
							{eliminar.isPending ? (
								<LoaderCircle className="animate-spin" />
							) : (
								<Trash />
							)}
							Eliminar definitivamente
						</Button>
					) : (
						<span />
					)}
					<div className="flex gap-2">
						<Button
							variant="outline"
							onClick={() => cerrar(false)}
							disabled={ocupado}
						>
							Cancelar
						</Button>
						<Button
							onClick={() => archivar.mutate(!course.archivado)}
							disabled={ocupado}
						>
							{archivar.isPending ? (
								<LoaderCircle className="animate-spin" />
							) : course.archivado ? (
								<ArchiveRestore />
							) : (
								<Archive />
							)}
							{course.archivado ? "Desarchivar" : "Archivar"}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
