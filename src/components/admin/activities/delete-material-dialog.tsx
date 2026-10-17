import { LoaderCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteMaterial } from "#/hooks/activities/use-delete-material";
import type { Material } from "#/lib/schemas/activities";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";

interface DeleteMaterialDialogProps {
	activityId: string;
	material: Material;
}

/**
 * Criterio 1 de HU-039: se pide confirmacion antes de quitar un archivo.
 *
 * El dialogo nombra el archivo y avisa que no se puede deshacer, porque el
 * backend lo borra tambien del almacenamiento: despues de aceptar no hay de
 * donde recuperarlo.
 */
export function DeleteMaterialDialog({
	activityId,
	material,
}: DeleteMaterialDialogProps) {
	const [open, setOpen] = useState(false);
	const { mutate, isPending } = useDeleteMaterial(activityId);

	function confirmar() {
		mutate(
			{ id: material.id },
			{
				onSuccess: () => {
					toast.success(`Se eliminó «${material.nombre}»`);
					setOpen(false);
				},
				// El mensaje viene del backend: explica si fue un permiso, si el
				// material ya no estaba, o cualquier otra cosa.
				onError: (error) => toast.error(error.message),
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="ghost" size="icon" className="size-8">
					<Trash2 className="size-4" />
					<span className="sr-only">Eliminar {material.nombre}</span>
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>¿Eliminar este material?</DialogTitle>
					<DialogDescription>
						Se va a quitar <strong>{material.nombre}</strong> de la actividad y
						se borrará del almacenamiento. La actividad no se elimina, pero el
						archivo no se puede recuperar.
					</DialogDescription>
				</DialogHeader>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancelar
					</Button>
					<Button variant="destructive" onClick={confirmar} disabled={isPending}>
						{isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
						Eliminar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
