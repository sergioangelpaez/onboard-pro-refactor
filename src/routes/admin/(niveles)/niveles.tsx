import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, Plus, RotateCcw, Save, Star, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "#/components/shared/states/empty-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { nivelesService, type TablaNiveles } from "#/lib/services/niveles";
import { rolReal } from "#/lib/utils/auth/session";
import { queryKeys } from "#/lib/utils/query-keys";

export const Route = createFileRoute("/admin/(niveles)/niveles")({
	component: NivelesRoute,
});

/**
 * La tabla de niveles de la organización (HU-053): cuánto XP pide cada nivel
 * y cómo se llama. Si no se define, se usa la curva por defecto.
 *
 * El superadmin trabaja sobre la organización que eligió en el menú.
 */
function NivelesRoute() {
	const { user } = useCurrentUser();
	const esSuper = rolReal(user?.role) === "superadmin";
	const organizacion = useOrganizacionActiva();
	const tenant = esSuper ? organizacion : null;

	const tabla = useQuery({
		queryKey: queryKeys.gamification.niveles(tenant),
		queryFn: () => nivelesService.get(tenant),
		enabled: !esSuper || !!organizacion,
	});

	return (
		<div className="app-container space-y-6">
			<div>
				<h1>Niveles</h1>
				<p className="text-muted-foreground">
					Cuánto XP pide cada nivel en tu organización y cómo se llama.
				</p>
			</div>

			{esSuper && !organizacion && (
				<EmptyState
					title="Elige una organización"
					description="Cada organización tiene su propia tabla de niveles. Elígela en el selector de arriba del menú."
				/>
			)}

			{tabla.isLoading && (
				<LoadingState message="Cargando la tabla de niveles..." />
			)}

			{tabla.data && (
				// La key reinicia el editor cuando llega una versión nueva del servidor.
				<Editor
					key={JSON.stringify(tabla.data.niveles)}
					tabla={tabla.data}
					tenant={tenant}
				/>
			)}
		</div>
	);
}

interface Fila {
	key: string;
	xpMinimo: string;
	nombre: string;
}

function Editor({
	tabla,
	tenant,
}: {
	tabla: TablaNiveles;
	tenant: string | null;
}) {
	const queryClient = useQueryClient();
	const [filas, setFilas] = useState<Fila[]>(() =>
		tabla.niveles.map((n) => ({
			key: crypto.randomUUID(),
			xpMinimo: String(n.xpMinimo),
			nombre: n.nombre ?? "",
		})),
	);
	const [cambios, setCambios] = useState(false);
	const [confirmar, setConfirmar] = useState<"guardar" | "restaurar" | null>(
		null,
	);

	const cambiar = (f: (fs: Fila[]) => Fila[]) => {
		setFilas(f);
		setCambios(true);
	};

	// Se avisa en la fila apenas el XP no sube, antes de mandar nada.
	const errorEn = (i: number) => {
		const xp = Number(filas[i].xpMinimo);
		if (!Number.isInteger(xp) || xp <= 0)
			return "Tiene que ser un entero mayor que cero";
		const anterior = i > 0 ? Number(filas[i - 1].xpMinimo) : 0;
		if (xp <= anterior) return `Tiene que ser mayor que ${anterior}`;
		return null;
	};
	const hayErrores = filas.some((_, i) => errorEn(i));
	const maximo = Math.max(...filas.map((f) => Number(f.xpMinimo) || 0), 1);

	const alTerminar = (r: {
		message: string;
		personasConNivelNuevo: number;
	}) => {
		toast.success(r.message, {
			description:
				r.personasConNivelNuevo === 0
					? "Nadie cambió de nivel."
					: `${r.personasConNivelNuevo} ${r.personasConNivelNuevo === 1 ? "persona cambió" : "personas cambiaron"} de nivel.`,
		});
		queryClient.invalidateQueries({ queryKey: ["gamification"] });
		queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
		setConfirmar(null);
	};

	const guardar = useMutation({
		mutationFn: () =>
			nivelesService.save(
				filas.map((f) => ({
					xpMinimo: Number(f.xpMinimo),
					nombre: f.nombre.trim(),
				})),
				tenant,
			),
		onSuccess: alTerminar,
		onError: (e: Error) =>
			toast.error("No se pudo guardar la tabla", { description: e.message }),
	});
	const restaurar = useMutation({
		mutationFn: () => nivelesService.restore(tenant),
		onSuccess: alTerminar,
		onError: (e: Error) =>
			toast.error("No se pudo restaurar la tabla", { description: e.message }),
	});
	const ocupado = guardar.isPending || restaurar.isPending;

	function agregar() {
		cambiar((fs) => {
			const ultimo = Number(fs.at(-1)?.xpMinimo) || 0;
			const penultimo = Number(fs.at(-2)?.xpMinimo) || 0;
			// El siguiente pide un poco más de lo que pidió el último salto.
			const salto = Math.max(ultimo - penultimo + 50, 100);
			return [
				...fs,
				{
					key: crypto.randomUUID(),
					xpMinimo: String(ultimo + salto),
					nombre: "",
				},
			];
		});
	}

	return (
		<>
			<Card>
				<CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
					<CardTitle className="flex items-center gap-2 text-base">
						Tabla de niveles
						<Badge variant={tabla.personalizada ? "default" : "secondary"}>
							{tabla.personalizada ? "Personalizada" : "Por defecto"}
						</Badge>
					</CardTitle>
					<span className="text-muted-foreground text-sm">
						{filas.length} niveles
					</span>
				</CardHeader>

				<CardContent className="space-y-4">
					<div className="hidden grid-cols-[5rem_1fr_9rem_2.5rem] gap-3 px-1 text-muted-foreground text-xs sm:grid">
						<span>Nivel</span>
						<span>Nombre (opcional)</span>
						<span>XP para llegar</span>
						<span />
					</div>

					<ol className="space-y-2">
						{filas.map((f, i) => {
							const error = errorEn(i);
							const ancho = Math.round(
								((Number(f.xpMinimo) || 0) * 100) / maximo,
							);
							return (
								<li
									key={f.key}
									className="grid grid-cols-[5rem_1fr_9rem_2.5rem] items-start gap-3 rounded-lg border p-2"
								>
									<span className="flex items-center gap-1.5 pt-2 font-semibold text-sm">
										<Star className="size-4 fill-amber-400 text-amber-500" />
										{i + 1}
									</span>
									<div className="space-y-1.5">
										<Input
											aria-label={`Nombre del nivel ${i + 1}`}
											placeholder={i === 0 ? "Nuevo ingreso" : `Nivel ${i + 1}`}
											maxLength={40}
											value={f.nombre}
											onChange={(e) =>
												cambiar((fs) =>
													fs.map((x) =>
														x.key === f.key
															? { ...x, nombre: e.target.value }
															: x,
													),
												)
											}
										/>
										{/* La forma de la curva, para ver si sube parejo. */}
										<div className="h-1.5 overflow-hidden rounded-full bg-muted">
											<div
												className="h-full rounded-full bg-amber-400"
												style={{ width: `${ancho}%` }}
											/>
										</div>
									</div>
									<div className="space-y-1">
										<Input
											aria-label={`XP para el nivel ${i + 1}`}
											type="number"
											min={1}
											value={f.xpMinimo}
											aria-invalid={!!error}
											onChange={(e) =>
												cambiar((fs) =>
													fs.map((x) =>
														x.key === f.key
															? { ...x, xpMinimo: e.target.value }
															: x,
													),
												)
											}
										/>
										{error && (
											<p className="text-destructive text-xs">{error}</p>
										)}
									</div>
									<Button
										type="button"
										size="icon"
										variant="ghost"
										aria-label={`Quitar el nivel ${i + 1}`}
										disabled={filas.length <= 1}
										onClick={() =>
											cambiar((fs) => fs.filter((x) => x.key !== f.key))
										}
									>
										<Trash />
									</Button>
								</li>
							);
						})}
					</ol>

					<div className="flex flex-wrap items-center justify-between gap-3">
						<Button
							type="button"
							variant="outline"
							onClick={agregar}
							disabled={filas.length >= 50}
						>
							<Plus />
							Agregar nivel
						</Button>
						<div className="flex flex-wrap items-center gap-2">
							{tabla.personalizada && (
								<Button
									variant="ghost"
									onClick={() => setConfirmar("restaurar")}
									disabled={ocupado}
								>
									<RotateCcw />
									Volver a la tabla por defecto
								</Button>
							)}
							{cambios && (
								<span className="text-muted-foreground text-sm">
									Hay cambios sin guardar
								</span>
							)}
							<Button
								onClick={() => setConfirmar("guardar")}
								disabled={!cambios || hayErrores || ocupado}
							>
								<Save />
								Guardar tabla
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			<Dialog
				open={confirmar !== null}
				onOpenChange={(v) => !v && setConfirmar(null)}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{confirmar === "restaurar"
								? "¿Volver a la tabla por defecto?"
								: "¿Guardar la tabla de niveles?"}
						</DialogTitle>
						<DialogDescription>
							Se va a recalcular el nivel de todas las personas de la
							organización según su XP. Si los niveles quedan más exigentes,
							algunas personas pueden bajar de nivel.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmar(null)}
							disabled={ocupado}
						>
							Cancelar
						</Button>
						<Button
							onClick={() =>
								confirmar === "restaurar"
									? restaurar.mutate()
									: guardar.mutate()
							}
							disabled={ocupado}
						>
							{ocupado && <LoaderCircle className="animate-spin" />}
							{confirmar === "restaurar"
								? "Restaurar y recalcular"
								: "Guardar y recalcular"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
