import { Link } from "@tanstack/react-router";
import {
	ChevronDown,
	FileCheck2,
	MessageSquare,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { useState } from "react";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "#/components/ui/collapsible";
import { useMisEntregas } from "#/hooks/entregas/use-mis-entregas";
import type { EntregaPropia } from "#/lib/services/entregas";
import { fechaCorta, fechaHora, haceCuanto } from "#/lib/utils/fechas";

/** Los mismos textos que en la actividad, para que el estado se lea igual. */
const ESTADO: Record<
	EntregaPropia["estado"],
	{ texto: string; variant: "default" | "secondary" | "destructive" }
> = {
	entregado: { texto: "En revisión", variant: "secondary" },
	aprobada: { texto: "Aprobada", variant: "default" },
	rehacer: { texto: "Hay que rehacerla", variant: "destructive" },
};

/**
 * Todas las entregas del aprendiz en un solo lugar (HU-049).
 *
 * Sin esto, para saber si ya le revisaron algo tenía que entrar curso por
 * curso y actividad por actividad. Primero van las que piden cambios: son
 * las únicas en las que tiene algo que hacer.
 */
export function MisEntregasCard({ className }: { className?: string }) {
	const { data, isLoading, error, refetch } = useMisEntregas();

	const ordenadas = [...(data ?? [])].sort((a, b) => {
		const prioridad = (e: EntregaPropia) => (e.estado === "rehacer" ? 0 : 1);
		return (
			prioridad(a) - prioridad(b) ||
			(b.entregadoAt ?? "").localeCompare(a.entregadoAt ?? "")
		);
	});

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<FileCheck2 className="size-4" />
					Mis entregas
				</CardTitle>
				<CardDescription>
					El estado de cada tarea que entregaste y lo que te respondieron.
				</CardDescription>
			</CardHeader>
			<CardContent>
				{isLoading && <LoadingState message="Cargando tus entregas..." />}

				{!data && error && (
					<ErrorState
						title="No se pudieron cargar tus entregas"
						description={error.message}
						content={
							<Button onClick={() => refetch()}>
								<RefreshCw />
								Reintentar
							</Button>
						}
					/>
				)}

				{data && data.length === 0 && (
					<EmptyState
						title="Todavía no entregaste nada"
						description="Cuando entregues una tarea, aquí verás si la aprobaron y qué te comentaron."
					/>
				)}

				{ordenadas.length > 0 && (
					<ul className="divide-y rounded-lg border">
						{ordenadas.map((e) => (
							<FilaEntrega key={e.id} entrega={e} />
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}

function FilaEntrega({ entrega }: { entrega: EntregaPropia }) {
	// Las que piden cambios se abren solas: es lo que hay que leer.
	const [abierta, setAbierta] = useState(entrega.estado === "rehacer");
	const estado = ESTADO[entrega.estado];
	const revisada = entrega.estado !== "entregado";
	const revisor = entrega.revisadoPor
		? `${entrega.revisadoPor.firstname} ${entrega.revisadoPor.lastname}`.trim()
		: null;

	return (
		<li>
			<Collapsible open={abierta} onOpenChange={setAbierta}>
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 p-3">
					<div className="min-w-0 flex-1">
						<Link
							to="/student/courses/$courseId"
							params={{ courseId: entrega.curso.id }}
							className="block truncate font-medium text-sm hover:underline"
						>
							{entrega.actividad.titulo}
						</Link>
						<p className="truncate text-muted-foreground text-xs">
							{entrega.curso.nombre}
							{entrega.entregadoAt &&
								` · Entregada el ${fechaCorta(entrega.entregadoAt)}`}
						</p>
					</div>
					{entrega.estado === "aprobada" && (entrega.xpObtenido ?? 0) > 0 && (
						<span className="inline-flex items-center gap-1 font-semibold text-emerald-700 text-xs tabular-nums dark:text-emerald-300">
							<Sparkles className="size-3" />+{entrega.xpObtenido} XP
						</span>
					)}
					<Badge variant={estado.variant}>{estado.texto}</Badge>
					{revisada && (
						<CollapsibleTrigger asChild>
							<Button
								size="sm"
								variant="ghost"
								className="h-7 px-2 text-xs"
								aria-label={abierta ? "Ocultar comentario" : "Ver comentario"}
							>
								<MessageSquare className="size-3.5" />
								<span className="hidden sm:inline">Comentario</span>
								<ChevronDown
									className={`size-3.5 transition-transform ${abierta ? "rotate-180" : ""}`}
								/>
							</Button>
						</CollapsibleTrigger>
					)}
				</div>
				{revisada && (
					<CollapsibleContent>
						<div className="mx-3 mb-3 space-y-1 rounded-md bg-muted/60 p-3">
							{entrega.feedback ? (
								<p className="whitespace-pre-line text-sm">
									{entrega.feedback}
								</p>
							) : (
								<p className="text-muted-foreground text-sm italic">
									Sin comentarios.
								</p>
							)}
							<p
								className="text-muted-foreground text-xs"
								title={fechaHora(entrega.revisadoAt) ?? undefined}
							>
								{revisor ? `Revisó ${revisor}` : "Revisada"}
								{entrega.revisadoAt && ` · ${haceCuanto(entrega.revisadoAt)}`}
							</p>
						</div>
					</CollapsibleContent>
				)}
			</Collapsible>
		</li>
	);
}
