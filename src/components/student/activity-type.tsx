import { FileText, Gamepad2, GraduationCap, PencilLine } from "lucide-react";

/** Cada tipo de actividad con su icono, para distinguirlas de un vistazo. */
export const TIPOS: Record<
	string,
	{ icono: React.ReactNode; etiqueta: string }
> = {
	Recurso: { icono: <FileText className="size-4" />, etiqueta: "Recurso" },
	Tarea: { icono: <PencilLine className="size-4" />, etiqueta: "Tarea" },
	Examen: { icono: <GraduationCap className="size-4" />, etiqueta: "Examen" },
	Concurso: { icono: <Gamepad2 className="size-4" />, etiqueta: "Concurso" },
};

export function tipoDe(type: string) {
	return TIPOS[type] ?? TIPOS.Recurso;
}
