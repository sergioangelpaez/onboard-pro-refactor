import { Link } from "@tanstack/react-router";
import {
	Check,
	ChevronDown,
	CircleCheck,
	Download,
	GraduationCap,
	LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { useActivityMaterials } from "#/hooks/activities/use-activity-materials";
import { useCompleteActivity } from "#/hooks/activities/use-complete-activity";
import type { SectionActivity } from "#/lib/schemas/courses";
import { tipoDe } from "./activity-type";
import { MiEntrega } from "./mi-entrega";

/** Cómo se ve el estado de una entrega del aprendiz. */
const ENTREGA: Record<
	string,
	{
		texto: string;
		variant: "default" | "secondary" | "outline" | "destructive";
	}
> = {
	entregado: { texto: "Entregada, en revisión", variant: "secondary" },
	aprobada: { texto: "Aprobada", variant: "default" },
	rehacer: { texto: "Hay que rehacerla", variant: "destructive" },
};

/**
 * Una actividad dentro del curso, vista por el aprendiz.
 *
 * Cada tipo se completa por su propio camino, y el botón lo respeta:
 *
 *   Recurso -> se lee el material y se marca como completada acá
 *   Tarea   -> se completa cuando aprueban la entrega
 *   Examen  -> se completa al aprobarlo
 *
 * Antes todas tenían "Marcar como completada", y en tareas y exámenes el
 * backend lo rechazaba: era un botón que siempre fallaba.
 */
export function StudentActivityItem({
	actividad,
	courseId,
	destacada = false,
}: {
	actividad: SectionActivity;
	courseId: string;
	/** Se abre y se lleva a la vista: viene de "Continuar" en la cabecera. */
	destacada?: boolean;
}) {
	const [abierta, setAbierta] = useState(false);
	const fila = useRef<HTMLLIElement>(null);

	useEffect(() => {
		if (!destacada) return;
		setAbierta(true);
		fila.current?.scrollIntoView({ behavior: "smooth", block: "center" });
	}, [destacada]);
	const tipo = tipoDe(actividad.type);
	const hecha = Boolean(actividad.completada);
	const entrega = actividad.entrega ? ENTREGA[actividad.entrega] : null;

	return (
		<li
			ref={fila}
			className={`rounded-md border transition-shadow ${destacada ? "ring-2 ring-primary/40" : ""}`}
		>
			<button
				type="button"
				onClick={() => setAbierta((v) => !v)}
				aria-expanded={abierta}
				className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent"
			>
				{hecha ? (
					<CircleCheck
						aria-label="Completada"
						className="size-5 shrink-0 fill-primary text-primary-foreground"
					/>
				) : (
					<span className="text-muted-foreground">{tipo.icono}</span>
				)}

				<div className="min-w-0 flex-1">
					<p
						className={`truncate font-medium text-sm ${hecha ? "text-muted-foreground line-through" : ""}`}
					>
						{actividad.title}
					</p>
					{actividad.description && (
						<p className="truncate text-muted-foreground text-xs">
							{actividad.description}
						</p>
					)}
				</div>

				{entrega && !hecha && (
					<Badge variant={entrega.variant} className="shrink-0">
						{entrega.texto}
					</Badge>
				)}
				<Badge variant="secondary" className="shrink-0">
					{tipo.etiqueta}
				</Badge>
				{actividad.xp != null && (
					<span className="shrink-0 text-muted-foreground text-xs tabular-nums">
						{actividad.xp} XP
					</span>
				)}
				<ChevronDown
					className={`size-4 shrink-0 text-muted-foreground transition-transform ${abierta ? "rotate-180" : ""}`}
				/>
			</button>

			{abierta && (
				<div className="space-y-3 border-t bg-muted/30 px-3 py-3">
					<Materiales activityId={actividad.id} />
					{actividad.type === "Tarea" && actividad.deliverable && (
						<MiEntrega activityId={actividad.id} />
					)}
					<Pie actividad={actividad} courseId={courseId} />
				</div>
			)}
		</li>
	);
}

/** El material de apoyo, pedido recién al abrir la actividad: los enlaces vencen en una hora. */
function Materiales({ activityId }: { activityId: string }) {
	const { data, isLoading, error } = useActivityMaterials(activityId);

	if (isLoading)
		return (
			<p className="text-muted-foreground text-sm">Cargando material...</p>
		);
	if (error)
		return (
			<p className="text-muted-foreground text-sm">
				No se pudo cargar el material.
			</p>
		);
	if (!data?.length) return null;

	return (
		<ul className="space-y-1">
			{data.map((m) => (
				<li key={m.id}>
					{m.url ? (
						<a
							href={m.url}
							target="_blank"
							rel="noreferrer"
							className="inline-flex items-center gap-1.5 text-primary text-sm hover:underline"
						>
							<Download className="size-4" />
							{m.nombre}
						</a>
					) : (
						<span className="text-muted-foreground text-sm">{m.nombre}</span>
					)}
				</li>
			))}
		</ul>
	);
}

/** Cómo se completa cada tipo, en una línea. Va a la izquierda del botón. */
function ayudaDe(actividad: SectionActivity) {
	if (actividad.completada) return "Ya la completaste.";
	if (actividad.type === "Examen") return "Se completa al aprobar el examen.";
	if (actividad.type === "Tarea") {
		if (actividad.entrega === "entregado")
			return "Tu entrega está en revisión. Se completa cuando la aprueben.";
		if (actividad.entrega === "rehacer")
			return "Te pidieron cambios: corrígela y vuelve a entregarla.";
		return "Sube tu trabajo: se completa cuando lo aprueben.";
	}
	return "Revisa el material y márcala cuando termines.";
}

/**
 * El pie de la actividad abierta: a la izquierda cómo se completa, a la
 * derecha la acción, si tiene. Un botón solo y pegado a la izquierda quedaba
 * suelto, sin decir qué pasaba al usarlo.
 */
function Pie({
	actividad,
	courseId,
}: {
	actividad: SectionActivity;
	courseId: string;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
			<p className="flex items-center gap-1.5 text-muted-foreground text-sm">
				{actividad.completada && <Check className="size-4 text-primary" />}
				{ayudaDe(actividad)}
			</p>
			{!actividad.completada && (
				<Accion actividad={actividad} courseId={courseId} />
			)}
		</div>
	);
}

function Accion({
	actividad,
	courseId,
}: {
	actividad: SectionActivity;
	courseId: string;
}) {
	const completar = useCompleteActivity();

	// La tarea se entrega con el formulario de arriba, no con un botón acá.
	if (actividad.type === "Tarea") return null;

	if (actividad.type === "Examen") {
		return (
			<Button asChild size="sm" variant="outline">
				<Link
					to="/student/exam/$activityId"
					params={{ activityId: actividad.id }}
					search={{ courseId }}
				>
					<GraduationCap />
					Rendir examen
				</Link>
			</Button>
		);
	}

	const enviando = completar.isPending;
	return (
		<Button
			size="sm"
			variant="outline"
			disabled={enviando}
			onClick={() =>
				completar.mutate(actividad.id, {
					onSuccess: () =>
						toast.success(`¡Actividad completada! +${actividad.xp ?? 0} XP`),
					onError: (e: Error) =>
						toast.error("No se pudo completar la actividad", {
							description: e.message,
						}),
				})
			}
		>
			{enviando ? <LoaderCircle className="animate-spin" /> : <Check />}
			Marcar como completada
		</Button>
	);
}
