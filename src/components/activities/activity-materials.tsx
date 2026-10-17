import {
	ExternalLink,
	FileText,
	Image as ImageIcon,
	LoaderCircle,
	Upload,
	Video,
} from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { useActivityMaterials } from "#/hooks/activities/use-activity-materials";
import { useAddMaterial } from "#/hooks/activities/use-add-material";
import type { Material } from "#/lib/schemas/activities";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { DeleteMaterialDialog } from "./delete-material-dialog";

/** 50 MB, el mismo tope que aplica el backend al recibir el archivo. */
const TOPE_BYTES = 50 * 1024 * 1024;

function iconoDe(mime?: string | null) {
	if (mime?.startsWith("image/")) return <ImageIcon className="size-4" />;
	if (mime?.startsWith("video/")) return <Video className="size-4" />;
	return <FileText className="size-4" />;
}

function pesoDe(bytes?: number | null) {
	if (!bytes) return null;
	const mb = bytes / 1024 / 1024;
	return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function MaterialRow({
	material,
	activityId,
	puedeEditar,
}: {
	material: Material;
	activityId: string;
	puedeEditar: boolean;
}) {
	return (
		<li className="flex items-center gap-3 rounded-md border px-3 py-2">
			<span className="text-muted-foreground">{iconoDe(material.mime)}</span>

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium text-sm">{material.nombre}</p>
				<p className="text-muted-foreground text-xs">
					{[material.mime, pesoDe(material.tamano)].filter(Boolean).join(" · ")}
				</p>
			</div>

			{material.url && (
				<Button variant="ghost" size="icon" className="size-8" asChild>
					<a href={material.url} target="_blank" rel="noreferrer">
						<ExternalLink className="size-4" />
						<span className="sr-only">Abrir {material.nombre}</span>
					</a>
				</Button>
			)}

			{puedeEditar && (
				<DeleteMaterialDialog activityId={activityId} material={material} />
			)}
		</li>
	);
}

interface ActivityMaterialsProps {
	activityId: string;
	puedeEditar: boolean;
}

/**
 * El material de apoyo de una actividad: listarlo (HU-038), agregar (HU-037)
 * y quitar uno (HU-039).
 *
 * Los enlaces son firmados y vencen en una hora, por eso se abren en otra
 * pestana en lugar de guardarse en ningun lado.
 */
export function ActivityMaterials({
	activityId,
	puedeEditar,
}: ActivityMaterialsProps) {
	const { data, isLoading, error } = useActivityMaterials(activityId);
	const { mutate, isPending } = useAddMaterial(activityId);
	const inputRef = useRef<HTMLInputElement>(null);

	function subir(file: File | undefined) {
		if (!file) return;

		// Criterio 2 de HU-037: el tamano se rechaza antes de subir, no despues
		// de esperar a que viajen 80 MB para que el servidor diga que no.
		if (file.size > TOPE_BYTES) {
			toast.error(
				`«${file.name}» pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo son 50 MB.`,
			);
			return;
		}

		mutate(
			{ file },
			{
				onSuccess: () => toast.success(`Se agregó «${file.name}»`),
				onError: (e) => toast.error(e.message),
			},
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle>Material de apoyo</CardTitle>

				{puedeEditar && (
					<>
						<input
							ref={inputRef}
							type="file"
							className="hidden"
							accept="image/*,video/*,application/pdf"
							onChange={(e) => {
								subir(e.target.files?.[0]);
								// Sin esto, elegir el mismo archivo dos veces seguidas no
								// dispara el evento y parece que el boton no hace nada.
								e.target.value = "";
							}}
						/>
						<Button
							size="sm"
							onClick={() => inputRef.current?.click()}
							disabled={isPending}
						>
							{isPending ? (
								<LoaderCircle className="animate-spin" />
							) : (
								<Upload />
							)}
							Agregar archivo
						</Button>
					</>
				)}
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
						No se pudo cargar el material: {error.message}
					</p>
				)}

				{data && data.length === 0 && (
					<p className="text-muted-foreground text-sm">
						Esta actividad todavía no tiene material de apoyo.
					</p>
				)}

				{data && data.length > 0 && (
					<ul className="space-y-2">
						{data.map((m) => (
							<MaterialRow
								key={m.id}
								material={m}
								activityId={activityId}
								puedeEditar={puedeEditar}
							/>
						))}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
