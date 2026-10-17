import {
	CheckCircle2,
	CircleDashed,
	Clock,
	LoaderCircle,
	RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEntregas } from "#/hooks/entregas/use-entregas";
import type { Entrega } from "#/lib/schemas/entregas";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Skeleton } from "#/components/ui/skeleton";
import { Textarea } from "#/components/ui/textarea";
import { SubmissionPreview } from "./submission-preview";

const ESTADOS = {
	entregado: { texto: "Por revisar", icono: Clock, variant: "default" as const },
	aprobada: { texto: "Completada", icono: CheckCircle2, variant: "secondary" as const },
	// Ya no se puede pedir que rehagan desde acá, pero el estado existe en la
	// base y hay entregas viejas que lo tienen: hay que saber mostrarlo.
	rehacer: { texto: "A rehacer", icono: RotateCcw, variant: "outline" as const },
	sin_entregar: { texto: "Sin entregar", icono: CircleDashed, variant: "outline" as const },
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

function FilaEntrega({
	entrega,
	activityId,
}: {
	entrega: Entrega;
	activityId: string;
}) {
	const [abierto, setAbierto] = useState(false);
	const [feedback, setFeedback] = useState(entrega.feedback ?? "");
	const { revisar } = useEntregas(activityId);

	const estado = ESTADOS[entrega.estado] ?? ESTADOS.entregado;
	const Icono = estado.icono;
	const entrego = entrega.estado !== "sin_entregar";

	/**
	 * Dar la entrega por completada.
	 *
	 * No hay "pedir cambios": quien revisa deja un comentario si tiene algo que
	 * decir y la marca como hecha. El comentario es opcional.
	 */
	function completar() {
		if (!entrega.id) return;

		revisar.mutate(
			{ entregaId: entrega.id, aprobada: true, feedback: feedback.trim() },
			{
				onSuccess: (r) => {
					toast.success(
						`Entrega completada${r.xpAcreditado ? ` · +${r.xpAcreditado} XP` : ""}`,
					);
					setAbierto(false);
				},
				onError: (e) => toast.error(e.message),
			},
		);
	}

	return (
		<li className="rounded-md border">
			<div className="flex items-center gap-3 px-3 py-2">
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">
						{entrega.aprendiz
							? `${entrega.aprendiz.firstname} ${entrega.aprendiz.lastname}`
							: "Aprendiz desconocido"}
					</p>
					<p className="truncate text-muted-foreground text-xs">
						{entrego
							? `${fecha(entrega.entregadoAt)}${entrega.comentario ? ` · ${entrega.comentario}` : ""}`
							: "Todavía no entregó"}
					</p>
				</div>

				<Badge variant={estado.variant} className="shrink-0 gap-1">
					<Icono className="size-3" />
					{estado.texto}
				</Badge>

				{entrego && (
					<Button variant="outline" size="sm" onClick={() => setAbierto(!abierto)}>
						{entrega.estado === "entregado" ? "Revisar" : "Ver comentario"}
					</Button>
				)}
			</div>

			{abierto && (
				<div className="space-y-3 border-t px-3 py-3">
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
					/>

					{/* Ver y descargar a la izquierda, la decisión a la derecha: lo que
					    se consulta y lo que se resuelve, separados. */}
					<div className="flex flex-wrap items-center justify-between gap-2">
						{entrega.archivo && entrega.id ? (
							<SubmissionPreview
								entregaId={entrega.id}
								mime={entrega.mime}
								nombre={
									entrega.aprendiz
										? `${entrega.aprendiz.firstname} ${entrega.aprendiz.lastname}`
										: "el aprendiz"
								}
							/>
						) : (
							<p className="text-muted-foreground text-sm">
								No adjuntó ningún archivo.
							</p>
						)}

						<Button
							size="sm"
							onClick={completar}
							disabled={revisar.isPending || entrega.estado === "aprobada"}
						>
							{revisar.isPending ? (
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
 * Las entregas de una actividad y su revisión (HU-048).
 *
 * No hay nota: se aprueba o se pide rehacer, y el comentario es obligatorio en
 * los dos casos. El XP se acredita al aprobar, nunca al subir el archivo.
 */
export function ActivitySubmissions({ activityId }: { activityId: string }) {
	const { data, isLoading, error } = useEntregas(activityId);

	const porRevisar = (data ?? []).filter((e) => e.estado === "entregado").length;
	const sinEntregar = (data ?? []).filter((e) => e.estado === "sin_entregar").length;

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle>Entregas</CardTitle>
				<div className="flex items-center gap-2">
					{porRevisar > 0 && <Badge>{porRevisar} por revisar</Badge>}
					{sinEntregar > 0 && (
						<Badge variant="outline">{sinEntregar} sin entregar</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent>
				{isLoading && (
					<div className="space-y-2">
						<Skeleton className="h-12 w-full" />
						<Skeleton className="h-12 w-full" />
					</div>
				)}

				{error && (
					<p className="text-destructive text-sm">
						No se pudieron cargar las entregas: {error.message}
					</p>
				)}

				{data && data.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Esta actividad no está asignada a ningún grupo, así que todavía no
						le toca a nadie.
					</p>
				)}

				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((e) => (
							<FilaEntrega
								key={e.id ?? e.userId}
								entrega={e}
								activityId={activityId}
							/>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
