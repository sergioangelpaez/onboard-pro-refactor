import { LoaderCircle, Paperclip, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateActivity } from "#/hooks/activities/use-create-activity";
import type { Section } from "#/lib/schemas/courses";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Field, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

/** 50 MB, el mismo tope que aplica el backend. */
const TOPE_BYTES = 50 * 1024 * 1024;

/** XP por defecto de cada tipo, igual que en helpers/niveles.js del backend. */
const XP_POR_TIPO: Record<string, number> = { Recurso: 10, Tarea: 30, Examen: 50 };

interface CreateActivityDialogProps {
	courseId: string;
	sections: Section[];
}

/**
 * Crear una actividad dentro de una seccion del curso (HU-034), con su
 * material de apoyo en la misma operacion.
 *
 * El adjunto es opcional: una actividad puede nacer vacia y recibir archivos
 * despues desde su propia pantalla.
 */
export function CreateActivityDialog({
	courseId,
	sections,
}: CreateActivityDialogProps) {
	const [open, setOpen] = useState(false);
	const [sectionId, setSectionId] = useState(sections[0]?.id ?? "");
	const [title, setTitle] = useState("");
	const [type, setType] = useState("Recurso");
	const [description, setDescription] = useState("");
	const [file, setFile] = useState<File | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { mutate, isPending } = useCreateActivity(courseId);

	// Si pide entrega lo decide el tipo, no una casilla aparte: una tarea y un
	// examen siempre se entregan, y un recurso se marca como visto. Preguntarlo
	// era ofrecer combinaciones que no existen.
	const pideEntrega = type !== "Recurso";

	function limpiar() {
		setTitle("");
		setType("Recurso");
		setDescription("");
		setFile(null);
	}

	function elegirArchivo(elegido: File | undefined) {
		if (!elegido) return;
		// Se rechaza antes de subir, no despues de esperar a que viajen 80 MB.
		if (elegido.size > TOPE_BYTES) {
			toast.error(
				`«${elegido.name}» pesa ${(elegido.size / 1024 / 1024).toFixed(1)} MB y el máximo son 50 MB.`,
			);
			return;
		}
		setFile(elegido);
	}

	function guardar() {
		if (!title.trim()) return toast.error("La actividad necesita un título.");
		if (!sectionId) return toast.error("Elegí en qué sección va.");

		mutate(
			{
				sectionId,
				// El backend pide `name` además del título: es el identificador
				// corto. Se deriva del título para no pedir dos campos que
				// quien carga el contenido escribiría igual.
				name: title.trim().slice(0, 50),
				title: title.trim(),
				type,
				description: description.trim() || undefined,
				deliverable: pideEntrega,
				xp: XP_POR_TIPO[type],
				file,
			},
			{
				onSuccess: () => {
					toast.success(`Se creó «${title.trim()}»`);
					limpiar();
					setOpen(false);
				},
				onError: (error) => toast.error(error.message),
			},
		);
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button disabled={sections.length === 0}>
					<Plus />
					Crear actividad
				</Button>
			</DialogTrigger>

			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>Nueva actividad</DialogTitle>
					<DialogDescription>
						Se crea dentro de una sección del curso. El material de apoyo es
						opcional y se le pueden agregar más archivos después.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<Field>
						<FieldLabel htmlFor="actividad-titulo">Título</FieldLabel>
						<Input
							id="actividad-titulo"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="Bienvenida a la empresa"
							maxLength={100}
						/>
					</Field>

					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="actividad-seccion">Sección</FieldLabel>
							<Select value={sectionId} onValueChange={setSectionId}>
								<SelectTrigger id="actividad-seccion">
									<SelectValue placeholder="Elegí una sección" />
								</SelectTrigger>
								<SelectContent>
									{sections.map((s) => (
										<SelectItem key={s.id} value={s.id}>
											{s.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="actividad-tipo">Tipo</FieldLabel>
							<Select value={type} onValueChange={setType}>
								<SelectTrigger id="actividad-tipo">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Recurso">Recurso</SelectItem>
									<SelectItem value="Tarea">Tarea</SelectItem>
									<SelectItem value="Examen">Examen</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					<p className="-mt-2 text-muted-foreground text-xs">
						{pideEntrega
							? type === "Tarea"
								? "El aprendiz sube un trabajo y vos lo revisás."
								: "El aprendiz lo resuelve en la plataforma."
							: "Material que el aprendiz consulta y marca como visto."}
					</p>

					<Field>
						<FieldLabel htmlFor="actividad-descripcion">Descripción</FieldLabel>
						<Textarea
							id="actividad-descripcion"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Qué tiene que hacer o leer la persona."
							maxLength={400}
							rows={3}
						/>
					</Field>



					<Field>
						<FieldLabel>Material de apoyo</FieldLabel>
						<input
							ref={inputRef}
							type="file"
							className="hidden"
							accept="image/*,video/*,application/pdf"
							onChange={(e) => {
								elegirArchivo(e.target.files?.[0]);
								e.target.value = "";
							}}
						/>

						{file ? (
							<div className="flex items-center gap-2 rounded-md border px-3 py-2">
								<Paperclip className="size-4 shrink-0 text-muted-foreground" />
								<span className="min-w-0 flex-1 truncate text-sm">
									{file.name}
								</span>
								<Button
									variant="ghost"
									size="icon"
									className="size-7"
									onClick={() => setFile(null)}
									aria-label="Quitar el archivo"
								>
									<X className="size-4" />
								</Button>
							</div>
						) : (
							<Button
								type="button"
								variant="outline"
								onClick={() => inputRef.current?.click()}
							>
								<Paperclip />
								Elegir archivo
							</Button>
						)}
					</Field>
				</div>

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
						Crear actividad
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
