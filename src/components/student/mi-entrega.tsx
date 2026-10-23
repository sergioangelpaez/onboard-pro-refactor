import {
	ExternalLink,
	LoaderCircle,
	MessageSquare,
	Paperclip,
	Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import { useMiEntrega } from "#/hooks/entregas/use-mi-entrega";
import {
	type MiEntrega as Entrega,
	entregasService,
} from "#/lib/services/entregas";

/** El mismo tope que aplica el backend al recibir el archivo. */
const MAX_BYTES = 50 * 1024 * 1024;
const TIPOS_ACEPTADOS = "image/*,video/*,application/pdf";

const ESTADO: Record<
	Entrega["estado"],
	{ texto: string; variant: "default" | "secondary" | "destructive" }
> = {
	entregado: { texto: "En revisión", variant: "secondary" },
	aprobada: { texto: "Aprobada", variant: "default" },
	rehacer: { texto: "Hay que rehacerla", variant: "destructive" },
};

function fecha(iso?: string | null) {
	if (!iso) return null;
	return new Date(iso).toLocaleString("es", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

/**
 * La entrega del aprendiz en una tarea: qué subió, cómo va y qué le dijeron.
 *
 * Mientras no esté aprobada se puede reemplazar. Si ya entregó, el formulario
 * queda plegado detrás de "Reemplazar": lo normal es esperar la revisión, no
 * volver a subir.
 */
export function MiEntrega({ activityId }: { activityId: string }) {
	const {
		data: entrega,
		isLoading,
		error,
		entregar,
	} = useMiEntrega(activityId);
	const [reemplazando, setReemplazando] = useState(false);

	if (isLoading)
		return (
			<p className="text-muted-foreground text-sm">Cargando tu entrega...</p>
		);
	if (error)
		return (
			<p className="text-muted-foreground text-sm">
				No se pudo cargar tu entrega: {error.message}
			</p>
		);

	const puedeEntregar = entrega?.estado !== "aprobada";
	// Sin entrega o con cambios pedidos, el formulario se muestra de entrada.
	const formularioAbierto =
		!entrega || entrega.estado === "rehacer" || reemplazando;

	return (
		<div className="space-y-3">
			{entrega && <Detalle entrega={entrega} />}

			{puedeEntregar && formularioAbierto && (
				<Formulario
					hayEntrega={Boolean(entrega)}
					rehacer={entrega?.estado === "rehacer"}
					enviando={entregar.isPending}
					onCancelar={
						entrega && entrega.estado !== "rehacer"
							? () => setReemplazando(false)
							: undefined
					}
					onEnviar={(archivo, comentario) =>
						entregar.mutate(
							{ archivo, comentario },
							{
								onSuccess: (r) => {
									toast.success(r.message);
									setReemplazando(false);
								},
								onError: (e: Error) =>
									toast.error("No se pudo entregar", {
										description: e.message,
									}),
							},
						)
					}
				/>
			)}

			{puedeEntregar && !formularioAbierto && (
				<Button size="sm" variant="ghost" onClick={() => setReemplazando(true)}>
					<Upload />
					Reemplazar mi entrega
				</Button>
			)}
		</div>
	);
}

function Detalle({ entrega }: { entrega: Entrega }) {
	const [abriendo, setAbriendo] = useState(false);
	const estado = ESTADO[entrega.estado];

	async function abrirArchivo() {
		setAbriendo(true);
		try {
			// La URL se firma al momento y vence en una hora: no se guarda.
			const { url } = await entregasService.archivo(entrega.id);
			window.open(url, "_blank", "noopener");
		} catch (e) {
			toast.error("No se pudo abrir el archivo", {
				description: (e as Error).message,
			});
		} finally {
			setAbriendo(false);
		}
	}

	return (
		<div className="space-y-2 rounded-md border bg-background p-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="font-medium text-sm">Tu entrega</p>
				<Badge variant={estado.variant}>{estado.texto}</Badge>
			</div>
			{entrega.entregadoAt && (
				<p className="text-muted-foreground text-xs">
					Entregada el {fecha(entrega.entregadoAt)}
				</p>
			)}

			{entrega.comentario && (
				<p className="whitespace-pre-line text-sm">{entrega.comentario}</p>
			)}

			{entrega.archivo && (
				<Button
					size="sm"
					variant="outline"
					onClick={abrirArchivo}
					disabled={abriendo}
				>
					{abriendo ? <LoaderCircle className="animate-spin" /> : <Paperclip />}
					Ver archivo entregado
					<ExternalLink className="size-3.5" />
				</Button>
			)}

			{entrega.feedback && (
				<div className="mt-2 space-y-1 rounded-md bg-muted/60 p-3">
					<p className="flex items-center gap-1.5 font-medium text-xs">
						<MessageSquare className="size-3.5" />
						Comentario de quien revisó
						{entrega.revisadoAt && (
							<span className="font-normal text-muted-foreground">
								· {fecha(entrega.revisadoAt)}
							</span>
						)}
					</p>
					<p className="whitespace-pre-line text-sm">{entrega.feedback}</p>
				</div>
			)}
		</div>
	);
}

function Formulario({
	hayEntrega,
	rehacer,
	enviando,
	onEnviar,
	onCancelar,
}: {
	hayEntrega: boolean;
	rehacer: boolean;
	enviando: boolean;
	onEnviar: (archivo: File | null, comentario: string) => void;
	onCancelar?: () => void;
}) {
	const [archivo, setArchivo] = useState<File | null>(null);
	const [comentario, setComentario] = useState("");
	const input = useRef<HTMLInputElement>(null);

	const vacio = !archivo && !comentario.trim();

	function elegir(f: File | null) {
		if (f && f.size > MAX_BYTES) {
			toast.error("El archivo supera los 50 MB");
			if (input.current) input.current.value = "";
			return;
		}
		setArchivo(f);
	}

	return (
		<form
			className="space-y-3 rounded-md border bg-background p-3"
			onSubmit={(e) => {
				e.preventDefault();
				if (!vacio) onEnviar(archivo, comentario);
			}}
		>
			<p className="font-medium text-sm">
				{rehacer
					? "Vuelve a entregar con los cambios"
					: hayEntrega
						? "Reemplazar mi entrega"
						: "Entregar"}
			</p>

			<div className="flex flex-wrap items-center gap-2">
				<Button
					type="button"
					size="sm"
					variant="outline"
					onClick={() => input.current?.click()}
				>
					<Paperclip />
					{archivo ? "Cambiar archivo" : "Elegir archivo"}
				</Button>
				<span className="min-w-0 truncate text-muted-foreground text-sm">
					{archivo ? archivo.name : "Imagen, PDF o video, hasta 50 MB"}
				</span>
				<input
					ref={input}
					type="file"
					accept={TIPOS_ACEPTADOS}
					className="hidden"
					onChange={(e) => elegir(e.target.files?.[0] ?? null)}
				/>
			</div>

			<Textarea
				value={comentario}
				onChange={(e) => setComentario(e.target.value)}
				placeholder="Comentario para quien revisa (opcional)"
				rows={3}
			/>

			<div className="flex justify-end gap-2">
				{onCancelar && (
					<Button type="button" size="sm" variant="ghost" onClick={onCancelar}>
						Cancelar
					</Button>
				)}
				<Button type="submit" size="sm" disabled={vacio || enviando}>
					{enviando ? <LoaderCircle className="animate-spin" /> : <Upload />}
					{hayEntrega ? "Enviar de nuevo" : "Entregar"}
				</Button>
			</div>
		</form>
	);
}
