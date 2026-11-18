import {
	ArrowDownUp,
	CheckCircle2,
	Clock,
	Inbox,
	Layers,
	LoaderCircle,
	RefreshCw,
	RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SubmissionPreview } from "#/components/admin/activities/submission-preview";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent } from "#/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useBandeja } from "#/hooks/entregas/use-bandeja";
import type {
	EntregaDeBandeja,
	EstadoBandeja,
} from "#/lib/services/entregas";

const TODOS = "todos";

const FILTROS: {
	valor: EstadoBandeja;
	texto: string;
	contador: "porRevisar" | "rehacer" | "aprobadas" | "total";
	icono: React.ReactNode;
}[] = [
	{ valor: "entregado", texto: "Por revisar", contador: "porRevisar", icono: <Clock /> },
	{ valor: "aprobada", texto: "Completadas", contador: "aprobadas", icono: <CheckCircle2 /> },
	{ valor: "rehacer", texto: "A rehacer", contador: "rehacer", icono: <RotateCcw /> },
	{ valor: "todas", texto: "Todas", contador: "total", icono: <Layers /> },
];

const ESTADO = {
	entregado: { texto: "Por revisar", variant: "default" as const },
	aprobada: { texto: "Completada", variant: "secondary" as const },
	rehacer: { texto: "A rehacer", variant: "outline" as const },
};

function fecha(iso?: string | null) {
	if (!iso) return "—";
	return new Date(iso).toLocaleDateString("es-CO", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

/** Hace cuánto llegó: lo que ordena la cola de quien corrige. */
function haceCuanto(iso?: string | null) {
	if (!iso) return null;
	const horas = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
	if (horas < 1) return "hace un rato";
	if (horas < 24) return `hace ${horas} h`;
	const dias = Math.floor(horas / 24);
	return dias === 1 ? "hace 1 día" : `hace ${dias} días`;
}

function Fila({
	entrega,
	onRevisar,
	revisando,
}: {
	entrega: EntregaDeBandeja;
	onRevisar: (feedback: string) => void;
	revisando: boolean;
}) {
	const [abierta, setAbierta] = useState(false);
	const [feedback, setFeedback] = useState(entrega.feedback ?? "");
	const nombre = entrega.aprendiz
		? `${entrega.aprendiz.firstname} ${entrega.aprendiz.lastname}`
		: "Aprendiz desconocido";
	const estado = ESTADO[entrega.estado] ?? ESTADO.entregado;
	const atrasada =
		entrega.estado === "entregado" &&
		entrega.entregadoAt &&
		Date.now() - new Date(entrega.entregadoAt).getTime() > 3 * 86_400_000;

	return (
		<li className="rounded-lg border bg-card">
			<div className="flex flex-wrap items-center gap-3 px-4 py-3">
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium">{entrega.actividad.titulo}</p>
					<p className="truncate text-muted-foreground text-sm">
						{nombre} · {entrega.curso.nombre}
					</p>
				</div>
				<div className="text-right text-xs">
					<p className={atrasada ? "font-medium text-amber-600" : "text-muted-foreground"}>
						{haceCuanto(entrega.entregadoAt)}
					</p>
					<p className="text-muted-foreground">{fecha(entrega.entregadoAt)}</p>
				</div>
				<Badge variant={estado.variant}>{estado.texto}</Badge>
				<Button
					size="sm"
					variant={entrega.estado === "entregado" ? "default" : "outline"}
					onClick={() => setAbierta((v) => !v)}
					aria-expanded={abierta}
				>
					{entrega.estado === "entregado" ? "Revisar" : "Ver"}
				</Button>
			</div>

			{abierta && (
				<div className="space-y-3 border-t px-4 py-3">
					{entrega.comentario && (
						<div>
							<p className="mb-1 font-medium text-muted-foreground text-xs">
								Lo que escribió
							</p>
							<p className="rounded-md bg-muted px-3 py-2 text-sm">
								{entrega.comentario}
							</p>
						</div>
					)}
					<Textarea
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						placeholder="Comentario para el aprendiz (opcional)."
						rows={3}
						disabled={entrega.estado === "aprobada"}
					/>
					<div className="flex flex-wrap items-center justify-between gap-2">
						{entrega.archivo ? (
							<SubmissionPreview
								entregaId={entrega.id}
								mime={entrega.mime}
								nombre={nombre}
							/>
						) : (
							<p className="text-muted-foreground text-sm">
								No adjuntó ningún archivo.
							</p>
						)}
						<Button
							size="sm"
							onClick={() => onRevisar(feedback.trim())}
							disabled={revisando || entrega.estado === "aprobada"}
						>
							{revisando ? (
								<LoaderCircle className="animate-spin" />
							) : (
								<CheckCircle2 />
							)}
							{entrega.estado === "aprobada"
								? "Ya está completada"
								: "Marcar como completada"}
						</Button>
					</div>
				</div>
			)}
		</li>
	);
}

/**
 * La bandeja de quien corrige: las entregas de sus cursos (o de toda la
 * organización, para la administración), filtradas por estado y ordenadas
 * por fecha. Los contadores salen siempre completos, sin importar el filtro.
 */
export function BandejaEntregas({ tenantId }: { tenantId?: string | null }) {
	const [estado, setEstado] = useState<EstadoBandeja>("entregado");
	const [orden, setOrden] = useState<"antiguas" | "recientes">("antiguas");
	const [curso, setCurso] = useState(TODOS);
	const { data: cursos } = useAllCourses();
	const { data, isLoading, error, refetch, revisar } = useBandeja({
		estado,
		orden,
		cursoId: curso === TODOS ? undefined : curso,
		tenantId,
	});
	const [revisandoId, setRevisandoId] = useState<string | null>(null);

	function completar(entrega: EntregaDeBandeja, feedback: string) {
		setRevisandoId(entrega.id);
		revisar.mutate(
			{ entregaId: entrega.id, feedback },
			{
				onSuccess: (r) =>
					toast.success(
						`Entrega completada${r.xpAcreditado ? ` · +${r.xpAcreditado} XP para el aprendiz` : ""}`,
					),
				onError: (e: Error) =>
					toast.error("No se pudo completar la entrega", {
						description: e.message,
					}),
				onSettled: () => setRevisandoId(null),
			},
		);
	}

	return (
		<div className="app-container space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<h1>Entregas</h1>
					<p className="text-muted-foreground">
						Lo que te mandaron tus aprendices, para revisar en orden.
					</p>
				</div>
				{data && data.contadores.porRevisar > 0 && (
					<p className="rounded-full bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
						{data.contadores.porRevisar} por revisar
					</p>
				)}
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<div
					role="tablist"
					aria-label="Filtrar por estado"
					className="inline-flex flex-wrap rounded-lg border bg-muted/50 p-1"
				>
					{FILTROS.map((f) => {
						const n = data?.contadores[f.contador];
						return (
							<button
								key={f.valor}
								type="button"
								role="tab"
								aria-selected={estado === f.valor}
								onClick={() => setEstado(f.valor)}
								className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-medium text-sm transition-colors [&>svg]:size-4 ${
									estado === f.valor
										? "bg-background text-foreground shadow-sm"
										: "text-muted-foreground hover:text-foreground"
								}`}
							>
								{f.icono}
								{f.texto}
								{n !== undefined && (
									<span
										className={`rounded-full px-1.5 text-xs tabular-nums ${
											f.valor === "entregado" && n > 0
												? "bg-primary text-primary-foreground"
												: "bg-muted"
										}`}
									>
										{n}
									</span>
								)}
							</button>
						);
					})}
				</div>

				<Select value={curso} onValueChange={setCurso}>
					<SelectTrigger className="w-56" aria-label="Curso">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value={TODOS}>Todos los cursos</SelectItem>
						{(cursos ?? []).map((c) => (
							<SelectItem key={c.id} value={c.id}>
								{c.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					variant="outline"
					size="sm"
					onClick={() => setOrden((o) => (o === "antiguas" ? "recientes" : "antiguas"))}
				>
					<ArrowDownUp />
					{orden === "antiguas" ? "Más antiguas primero" : "Más recientes primero"}
				</Button>
			</div>

			{isLoading && <LoadingState message="Cargando las entregas..." />}

			{!data && error && (
				<ErrorState
					title="No se pudieron cargar las entregas"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{data && data.entregas.length === 0 && (
				<EmptyState
					title={estado === "entregado" ? "¡Estás al día!" : "No hay entregas acá"}
					description={
						estado === "entregado"
							? "No tienes entregas por revisar. Cuando alguien entregue, aparece acá."
							: "Prueba con otro filtro o con otro curso."
					}
				/>
			)}

			{data && data.entregas.length > 0 && (
				<Card>
					<CardContent className="p-3">
						<p className="mb-2 flex items-center gap-1.5 px-1 text-muted-foreground text-xs">
							<Inbox className="size-3.5" />
							{data.entregas.length}{" "}
							{data.entregas.length === 1 ? "entrega" : "entregas"}
						</p>
						<ul className="space-y-2">
							{data.entregas.map((e) => (
								<Fila
									key={e.id}
									entrega={e}
									revisando={revisandoId === e.id}
									onRevisar={(feedback) => completar(e, feedback)}
								/>
							))}
						</ul>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
