import {
	EllipsisVertical,
	LoaderCircle,
	Pencil,
	Power,
	PowerOff,
	Trash,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { useLogroAcciones } from "#/hooks/achievements/use-logro-acciones";
import type { Logro } from "#/lib/services/logros";
import { VistaPreviaLogro } from "./vista-previa-logro";

/** Editar nombre, descripción, meta y recompensa, con la vista previa a mano. */
function EditarLogro({
	logro,
	abierto,
	onAbierto,
}: {
	logro: Logro;
	abierto: boolean;
	onAbierto: (v: boolean) => void;
}) {
	const { editar } = useLogroAcciones();
	const [nombre, setNombre] = useState(logro.nombre);
	const [descripcion, setDescripcion] = useState(logro.descripcion ?? "");
	const [meta, setMeta] = useState(logro.condicion.meta);
	const [xp, setXp] = useState(logro.xpRecompensa);
	const valido =
		nombre.trim().length > 0 && Number.isInteger(meta) && meta >= 1 && xp >= 0;

	function guardar() {
		editar.mutate(
			{
				id: logro.id,
				cambios: {
					nombre: nombre.trim(),
					descripcion: descripcion.trim() || null,
					meta,
					xpRecompensa: xp,
				},
			},
			{
				onSuccess: () => {
					toast.success("Logro actualizado");
					onAbierto(false);
				},
				onError: (e: Error) =>
					toast.error("No se pudo actualizar el logro", {
						description: e.message,
					}),
			},
		);
	}

	return (
		<Dialog open={abierto} onOpenChange={onAbierto}>
			<DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Editar logro</DialogTitle>
					<DialogDescription>
						Cambiar la meta no le quita el logro a quien ya lo ganó.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="logro-nombre">Nombre</Label>
						<Input
							id="logro-nombre"
							value={nombre}
							onChange={(e) => setNombre(e.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="logro-descripcion">Descripción</Label>
						<Textarea
							id="logro-descripcion"
							rows={2}
							value={descripcion}
							onChange={(e) => setDescripcion(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1.5">
							<Label htmlFor="logro-meta">
								Meta{logro.condicion.unidad ? ` (${logro.condicion.unidad})` : ""}
							</Label>
							<Input
								id="logro-meta"
								type="number"
								min={1}
								value={Number.isNaN(meta) ? "" : meta}
								onChange={(e) => setMeta(e.target.valueAsNumber)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="logro-xp">XP de recompensa</Label>
							<Input
								id="logro-xp"
								type="number"
								min={0}
								value={Number.isNaN(xp) ? "" : xp}
								onChange={(e) => setXp(e.target.valueAsNumber)}
							/>
						</div>
					</div>
					<VistaPreviaLogro
						tipoCondicion={logro.condicion.tipo}
						meta={meta}
						cursoId={logro.cursoId ?? undefined}
						tenantId={logro.tenantId}
					/>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onAbierto(false)}>
						Cancelar
					</Button>
					<Button onClick={guardar} disabled={!valido || editar.isPending}>
						{editar.isPending && <LoaderCircle className="animate-spin" />}
						Guardar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

/**
 * El menú de cada logro: editar, activar o desactivar, eliminar. Uno inactivo
 * no se desbloquea, pero quien ya lo tenía lo conserva.
 */
export function AchievementActions({ logro }: { logro: Logro }) {
	const { editar, eliminar } = useLogroAcciones();
	const [editando, setEditando] = useState(false);
	const [borrando, setBorrando] = useState(false);

	function alternar() {
		editar.mutate(
			{ id: logro.id, cambios: { activo: !logro.activo } },
			{
				onSuccess: () =>
					toast.success(logro.activo ? "Logro desactivado" : "Logro activado", {
						description: logro.activo
							? "Ya no se desbloquea; quien lo ganó lo conserva."
							: "Se va a desbloquear cuando alguien cumpla la condición.",
					}),
				onError: (e: Error) =>
					toast.error("No se pudo cambiar el logro", { description: e.message }),
			},
		);
	}

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						size="icon"
						variant="ghost"
						className="size-8 shrink-0"
						aria-label={`Acciones de ${logro.nombre}`}
					>
						<EllipsisVertical />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onSelect={() => setEditando(true)}>
						<Pencil />
						Editar
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={alternar}>
						{logro.activo ? <PowerOff /> : <Power />}
						{logro.activo ? "Desactivar" : "Activar"}
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						variant="destructive"
						onSelect={() => setBorrando(true)}
					>
						<Trash />
						Eliminar
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{editando && (
				<EditarLogro logro={logro} abierto={editando} onAbierto={setEditando} />
			)}

			<Dialog open={borrando} onOpenChange={setBorrando}>
				<DialogContent className="sm:max-w-sm">
					<DialogHeader>
						<DialogTitle>¿Eliminar "{logro.nombre}"?</DialogTitle>
						<DialogDescription>
							Desaparece del catálogo y de los perfiles de quienes lo ganaron.
							Si solo quieres que deje de desbloquearse, mejor desactívalo.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setBorrando(false)}>
							Cancelar
						</Button>
						<Button
							variant="destructive"
							disabled={eliminar.isPending}
							onClick={() =>
								eliminar.mutate(logro.id, {
									onSuccess: () => {
										toast.success("Logro eliminado");
										setBorrando(false);
									},
									onError: (e: Error) =>
										toast.error("No se pudo eliminar", { description: e.message }),
								})
							}
						>
							{eliminar.isPending && <LoaderCircle className="animate-spin" />}
							Eliminar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
