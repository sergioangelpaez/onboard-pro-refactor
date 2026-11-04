import {
	Download,
	ExternalLink,
	Eye,
	File,
	FileText,
	Headphones,
	Image,
	Link as LinkIcon,
	Video,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { useActivityMaterials } from "#/hooks/activities/use-activity-materials";
import type { Material } from "#/lib/schemas/activities";

type Tipo = NonNullable<Material["tipo"]>;

const ICONO: Record<Tipo, React.ReactNode> = {
	pdf: <FileText className="size-4" />,
	video: <Video className="size-4" />,
	imagen: <Image className="size-4" />,
	audio: <Headphones className="size-4" />,
	enlace: <LinkIcon className="size-4" />,
	archivo: <File className="size-4" />,
};

const ETIQUETA: Record<Tipo, string> = {
	pdf: "PDF",
	video: "Video",
	imagen: "Imagen",
	audio: "Audio",
	enlace: "Enlace",
	archivo: "Archivo",
};

/** Si el backend todavía no manda el tipo, se deduce del mime. */
function tipoDe(m: Material): Tipo {
	if (m.tipo) return m.tipo;
	const mime = m.mime ?? "";
	if (mime === "application/pdf") return "pdf";
	if (mime.startsWith("video/")) return "video";
	if (mime.startsWith("image/")) return "imagen";
	if (mime.startsWith("audio/")) return "audio";
	return "archivo";
}

function tamano(bytes?: number | null) {
	if (!bytes) return null;
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** El material mostrado dentro de la plataforma, según su tipo. */
function Visor({ material, tipo }: { material: Material; tipo: Tipo }) {
	const url = material.url ?? "";
	if (tipo === "pdf") {
		return (
			<iframe
				src={url}
				title={material.nombre}
				className="h-full min-h-0 w-full flex-1 rounded-md border bg-background"
			/>
		);
	}
	if (tipo === "video") {
		return (
			<video
				src={url}
				controls
				playsInline
				className="max-h-full min-h-0 w-full flex-1 rounded-md border bg-black"
			>
				<track kind="captions" />
			</video>
		);
	}
	if (tipo === "imagen") {
		return (
			<img
				src={url}
				alt={material.nombre}
				className="min-h-0 w-full flex-1 rounded-md border bg-background object-contain"
			/>
		);
	}
	if (tipo === "audio") {
		return (
			<audio src={url} controls className="w-full">
				<track kind="captions" />
			</audio>
		);
	}
	return null;
}

function Fila({ material }: { material: Material }) {
	const tipo = tipoDe(material);
	// El backend dice qué se puede ver acá; un enlace externo se abre afuera.
	const previsualizable =
		material.previsualizable ??
		["pdf", "video", "imagen", "audio"].includes(tipo);
	const [viendo, setViendo] = useState(false);
	const peso = tamano(material.tamano);

	return (
		<li className="rounded-md border bg-background p-2">
			<div className="flex flex-wrap items-center gap-2">
				<span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
					{ICONO[tipo]}
				</span>
				<div className="min-w-0 flex-1">
					<p className="truncate font-medium text-sm">{material.nombre}</p>
					<p className="text-muted-foreground text-xs">
						{ETIQUETA[tipo]}
						{peso ? ` · ${peso}` : ""}
					</p>
				</div>

				{material.url ? (
					<div className="flex shrink-0 gap-1">
						{previsualizable && (
							<Button
								size="sm"
								variant="outline"
								onClick={() => setViendo(true)}
							>
								<Eye />
								Ver
							</Button>
						)}
						{tipo === "enlace" ? (
							<Button size="sm" variant="outline" asChild>
								<a href={material.url} target="_blank" rel="noreferrer">
									<ExternalLink />
									Abrir
								</a>
							</Button>
						) : (
							<Button size="sm" variant="ghost" asChild>
								<a
									href={material.url}
									target="_blank"
									rel="noreferrer"
									download={material.nombre}
									aria-label={`Descargar ${material.nombre}`}
								>
									<Download />
									<span className="hidden sm:inline">Descargar</span>
								</a>
							</Button>
						)}
					</div>
				) : (
					<span className="text-muted-foreground text-xs">No disponible</span>
				)}
			</div>

			{/* Casi a pantalla completa, como la vista de entregas del instructor:
			    se lee cómodo y se cierra con la X, Esc o tocando afuera. */}
			<Dialog open={viendo} onOpenChange={setViendo}>
				<DialogContent className="flex h-[94vh] w-[96vw] max-w-[96vw] flex-col gap-3 p-4 sm:max-w-[96vw]">
					{/* Título y descarga en una sola fila: el visor se queda con todo
					    el alto. El pr deja lugar a la X de cerrar. */}
					<div className="flex items-center justify-between gap-3 pr-8">
						<DialogHeader className="min-w-0 gap-0.5">
							<DialogTitle className="truncate">{material.nombre}</DialogTitle>
							<DialogDescription>
								{ETIQUETA[tipo]}
								{peso ? ` · ${peso}` : ""}
							</DialogDescription>
						</DialogHeader>
						<Button size="sm" variant="outline" asChild className="shrink-0">
							<a
								href={material.url ?? undefined}
								target="_blank"
								rel="noreferrer"
								download={material.nombre}
							>
								<Download />
								Descargar
							</a>
						</Button>
					</div>
					<div className="flex min-h-0 flex-1 flex-col items-center justify-center">
						{material.url && <Visor material={material} tipo={tipo} />}
					</div>
				</DialogContent>
			</Dialog>
		</li>
	);
}

/**
 * El material de apoyo de una actividad, para el aprendiz. Se pide recién al
 * abrir la actividad: los enlaces firmados vencen en una hora. Los PDF,
 * videos, imágenes y audios se ven acá mismo, sin salir de la plataforma.
 */
export function MaterialList({ activityId }: { activityId: string }) {
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
		<div className="space-y-1.5">
			<p className="font-medium text-muted-foreground text-xs">
				Material de apoyo · {data.length}
			</p>
			<ul className="space-y-1.5">
				{data.map((m) => (
					<Fila key={m.id} material={m} />
				))}
			</ul>
		</div>
	);
}
