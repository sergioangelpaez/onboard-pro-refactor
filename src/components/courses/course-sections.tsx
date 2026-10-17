import { Link } from "@tanstack/react-router";
import {
	ChevronRight,
	FileText,
	GraduationCap,
	Paperclip,
	PencilLine,
} from "lucide-react";
import type { Section, SectionActivity } from "#/lib/schemas/courses";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

/** Cada tipo de actividad con su icono, para distinguirlas de un vistazo. */
const TIPOS: Record<string, { icono: React.ReactNode; etiqueta: string }> = {
	Recurso: { icono: <FileText className="size-4" />, etiqueta: "Recurso" },
	Tarea: { icono: <PencilLine className="size-4" />, etiqueta: "Tarea" },
	Examen: { icono: <GraduationCap className="size-4" />, etiqueta: "Examen" },
};

function ActivityRow({ actividad }: { actividad: SectionActivity }) {
	const tipo = TIPOS[actividad.type] ?? TIPOS.Recurso;

	return (
		<li>
			<Link
				to="/activities/$activityId"
				params={{ activityId: actividad.id }}
				className="flex items-center gap-3 rounded-md border px-3 py-2 transition-colors hover:bg-accent"
			>
				<span className="text-muted-foreground">{tipo.icono}</span>

				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">{actividad.title}</p>
					{actividad.description && (
						<p className="truncate text-muted-foreground text-xs">
							{actividad.description}
						</p>
					)}
				</div>

				{/* La ruta del adjunto no sirve para descargar, pero sí para saber que
				    hay material sin pedir la lista de cada actividad. */}
				{actividad.adjunto && (
					<Paperclip className="size-4 shrink-0 text-muted-foreground" />
				)}

				{actividad.deliverable && (
					<Badge variant="outline" className="shrink-0">
						Entregable
					</Badge>
				)}

				<Badge variant="secondary" className="shrink-0">
					{tipo.etiqueta}
				</Badge>

				<ChevronRight className="size-4 shrink-0 text-muted-foreground" />
			</Link>
		</li>
	);
}

export function CourseSections({ sections }: { sections: Section[] }) {
	if (sections.length === 0) {
		return (
			<Card>
				<CardContent className="py-8 text-center text-muted-foreground text-sm">
					Este curso todavía no tiene secciones.
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{sections.map((seccion) => (
				<Card key={seccion.id}>
					<CardHeader className="flex flex-row items-center justify-between gap-2">
						<CardTitle>{seccion.name}</CardTitle>
						<span className="text-muted-foreground text-sm">
							{seccion.actividades.length}{" "}
							{seccion.actividades.length === 1 ? "actividad" : "actividades"}
						</span>
					</CardHeader>

					<CardContent>
						{seccion.actividades.length === 0 ? (
							<p className="text-muted-foreground text-sm">
								Esta sección está vacía.
							</p>
						) : (
							<ul className="space-y-2">
								{seccion.actividades.map((a) => (
									<ActivityRow key={a.id} actividad={a} />
								))}
							</ul>
						)}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
