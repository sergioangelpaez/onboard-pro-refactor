import { useQuery } from "@tanstack/react-query";
import { Download, Eye, FileText, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { entregasService } from "#/lib/services/entregas";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Skeleton } from "#/components/ui/skeleton";

/** Lo que subio, mostrado segun su tipo. */
function Visor({ url, mime }: { url: string; mime?: string | null }) {
	if (mime?.startsWith("image/")) {
		return (
			<img
				src={url}
				alt="Lo que entregó el aprendiz"
				className="max-h-[70vh] w-full rounded-md border object-contain"
			/>
		);
	}

	if (mime?.startsWith("video/")) {
		return (
			<video src={url} controls className="max-h-[70vh] w-full rounded-md border">
				<track kind="captions" />
			</video>
		);
	}

	if (mime === "application/pdf") {
		return (
			<iframe
				src={url}
				title="Entrega del aprendiz"
				className="h-[70vh] w-full rounded-md border"
			/>
		);
	}

	// Un .docx o un .zip no se pueden mostrar en el navegador.
	return (
		<div className="flex items-center gap-2 rounded-md border px-3 py-10 text-muted-foreground text-sm">
			<FileText className="size-4" />
			Este tipo de archivo no se puede ver acá. Descargalo para abrirlo.
		</div>
	);
}

interface SubmissionPreviewProps {
	entregaId: string;
	mime?: string | null;
	nombre: string;
}

/**
 * Ver o descargar lo que entrego el aprendiz.
 *
 * El archivo no se muestra incrustado en la lista: con varias entregas la
 * pantalla se volvia un muro de visores. Se abre en una ventana que se cierra
 * cuando termina de revisarse.
 *
 * La URL se pide recien al abrir o al descargar, no al listar: son firmadas,
 * vencen en una hora, y firmar las de todo el curso por si acaso seria pedir
 * decenas de enlaces que nadie va a usar.
 */
export function SubmissionPreview({
	entregaId,
	mime,
	nombre,
}: SubmissionPreviewProps) {
	const [abierto, setAbierto] = useState(false);
	const [descargando, setDescargando] = useState(false);

	const { data, isLoading, error } = useQuery({
		queryKey: ["entregas", entregaId, "archivo"],
		queryFn: () => entregasService.archivo(entregaId),
		enabled: abierto,
		staleTime: 1000 * 60 * 30,
	});

	async function descargar() {
		setDescargando(true);
		try {
			const { url } = await entregasService.archivo(entregaId);
			window.open(url, "_blank", "noopener");
		} finally {
			setDescargando(false);
		}
	}

	return (
		<>
			<div className="flex gap-2">
				<Button variant="outline" size="sm" onClick={() => setAbierto(true)}>
					<Eye />
					Ver
				</Button>

				<Button
					variant="outline"
					size="sm"
					onClick={descargar}
					disabled={descargando}
				>
					{descargando ? <LoaderCircle className="animate-spin" /> : <Download />}
					Descargar
				</Button>
			</div>

			<Dialog open={abierto} onOpenChange={setAbierto}>
				<DialogContent className="sm:max-w-4xl">
					<DialogHeader>
						<DialogTitle>Entrega de {nombre}</DialogTitle>
					</DialogHeader>

					{isLoading && <Skeleton className="h-[70vh] w-full" />}

					{error && (
						<p className="text-destructive text-sm">
							No se pudo abrir el archivo: {(error as Error).message}
						</p>
					)}

					{data?.url && <Visor url={data.url} mime={mime} />}
				</DialogContent>
			</Dialog>
		</>
	);
}
