import { useIsMutating } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	Check,
	ChevronDown,
	CircleCheck,
	Gamepad2,
	GraduationCap,
	LoaderCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { useCompleteActivity } from "#/hooks/activities/use-complete-activity";
import type { SectionActivity } from "#/lib/schemas/courses";
import { tipoDe } from "./activity-type";
import { MaterialList } from "./material-list";
import { MiEntrega } from "./mi-entrega";

/**
 * El estado de la actividad para el aprendiz: pendiente, entregada (espera
 * revisión) o completada. Una entrega devuelta para rehacer cuenta como
 * pendiente, pero conserva su aviso propio.
 */
const ESTADO: Record<
	"pendiente" | "entregada" | "completada",
	{ texto: string; clase: string }
> = {
	pendiente: {
		texto: "Pendiente",
		clase:
			"border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300",
	},
	entregada: {
		texto: "Entregada",
		clase:
			"border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-300",
	},
	completada: {
		texto: "Completada",
		clase:
			"border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-300",
	},
};

/** Si el backend todavía no manda `estado`, se deduce de lo que sí manda. */
function estadoDe(a: SectionActivity): keyof typeof ESTADO {
	if (a.estado) return a.estado;
	if (a.completada) return "completada";
	if (a.entrega === "entregado") return "entregada";
	return "pendiente";
}

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
	const estado = estadoDe(actividad);
	const hecha = estado === "completada";
	// Solo se muestra aparte el aviso de rehacer: lo demás ya lo dice el estado.
	const entrega =
		actividad.entrega === "rehacer" ? ENTREGA[actividad.entrega] : null;

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
				<Badge variant="outline" className={`shrink-0 ${ESTADO[estado].clase}`}>
					{ESTADO[estado].texto}
				</Badge>
				<Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
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
					<MaterialList activityId={actividad.id} />
					{actividad.type === "Tarea" && actividad.deliverable && (
						<MiEntrega activityId={actividad.id} />
					)}
					<Pie actividad={actividad} courseId={courseId} />
				</div>
			)}
		</li>
	);
}

/** Cómo se completa cada tipo, en una línea. Va a la izquierda del botón. */
function ayudaDe(actividad: SectionActivity) {
	if (actividad.completada && actividad.type === "Concurso")
		return "Ya ganaste sus puntos. Puedes seguir jugando para mejorar tu marca.";
	if (actividad.completada) return "Ya la completaste.";
	if (actividad.type === "Examen") return "Se completa al aprobar el examen.";
	if (actividad.type === "Concurso")
		return "Juega las veces que quieras: los puntos dependen de cómo te vaya y se ganan una sola vez.";
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
			{(!actividad.completada || actividad.type === "Concurso") && (
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

	if (actividad.type === "Concurso") {
		return (
			<Button asChild size="sm">
				<Link
					to="/student/exam/$activityId"
					params={{ activityId: actividad.id }}
					search={{ courseId }}
				>
					<Gamepad2 />
					Jugar
				</Link>
			</Button>
		);
	}

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

	// Mientras se guarda otra actividad, este botón también espera: dos
	// guardados a la vez se pisaban en los avisos y en la celebración.
	const guardandoAlguna =
		useIsMutating({ mutationKey: ["completar-actividad"] }) > 0;
	const enviando = completar.isPending || guardandoAlguna;
	return (
		<Button
			size="sm"
			variant="outline"
			disabled={enviando}
			onClick={() => completar.mutate(actividad.id)}
		>
			{enviando ? <LoaderCircle className="animate-spin" /> : <Check />}
			{enviando ? "Guardando…" : "Marcar como completada"}
		</Button>
	);
}
