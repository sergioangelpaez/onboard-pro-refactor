import { FolderPlus, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateSection } from "#/hooks/courses/use-create-section";
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
import { Field, FieldLabel } from "#/components/ui/field";
import { Input } from "#/components/ui/input";

/**
 * Crear una seccion del curso (HU-032).
 *
 * Las actividades cuelgan de una seccion, no del curso: sin al menos una, no
 * hay donde ponerlas. Por eso este boton va antes que el de crear actividad.
 */
export function CreateSectionDialog({ courseId }: { courseId: string }) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const { mutate, isPending } = useCreateSection(courseId);

	function guardar() {
		if (!name.trim()) return toast.error("La sección necesita un nombre.");

		mutate(
			{ name: name.trim() },
			{
				onSuccess: () => {
					toast.success(`Se creó «${name.trim()}»`);
					setName("");
					setOpen(false);
				},
				onError: (error) => toast.error(error.message),
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<FolderPlus />
					Crear sección
				</Button>
			</DialogTrigger>

			<DialogContent>
				<DialogHeader>
					<DialogTitle>Nueva sección</DialogTitle>
					<DialogDescription>
						Las secciones ordenan el curso por temas. Se agrega al final y
						después podés ponerle actividades.
					</DialogDescription>
				</DialogHeader>

				<Field>
					<FieldLabel htmlFor="seccion-nombre">Nombre</FieldLabel>
					<Input
						id="seccion-nombre"
						value={name}
						onChange={(e) => setName(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && guardar()}
						placeholder="Primeros pasos"
						maxLength={120}
					/>
				</Field>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setOpen(false)}
						disabled={isPending}
					>
						Cancelar
					</Button>
					<Button onClick={guardar} disabled={isPending}>
						{isPending && <LoaderCircle className="animate-spin" />}
						Crear sección
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
