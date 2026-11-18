import { createFileRoute } from "@tanstack/react-router";
import { LoaderCircle, RefreshCw, Trophy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AchievementCard } from "#/components/admin/achievements/achievement-card";
import { CreateAchievementDialogForm } from "#/components/admin/achievements/create-achievement-dialog-form";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { useLogroAcciones } from "#/hooks/achievements/use-logro-acciones";
import { useSoloLectura } from "#/hooks/users/use-solo-lectura";
import { useAchievements } from "#/hooks/achievements/use-achievements";
import { useAllCourses } from "#/hooks/courses/use-all-courses";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";
import { useCurrentUser } from "#/hooks/users/use-current-user";
import { rolReal } from "#/lib/utils/auth/session";

export const Route = createFileRoute("/admin/(achievements)/logros")({
	component: LogrosRoute,
});

/**
 * El catálogo de logros: los de la organización y los genéricos, agrupados por
 * categoría. El backend ya los manda ordenados por categoría y meta.
 */
function LogrosRoute() {
	const { data, isLoading, error, refetch } = useAchievements();
	const { data: cursos } = useAllCourses();
	const nombreCurso = new Map((cursos ?? []).map((c) => [c.id, c.name]));
	// Mirando todas las organizaciones, el superadmin necesita saber de cuál
	// es cada logro.
	const { user } = useCurrentUser();
	const esSuper = rolReal(user?.role) === "superadmin";
	const soloLectura = useSoloLectura();
	const { data: empresas } = useAllTenants(esSuper);
	const nombreEmpresa = new Map((empresas ?? []).map((e) => [e.id, e.name]));

	// Las medallas de puesto no se dan en tiempo real: se otorgan al cerrar.
	const hayDeRanking = (data ?? []).some(
		(l) => l.activo && l.condicion.tipo === "posicion_ranking",
	);

	const porCategoria = new Map<string, NonNullable<typeof data>>();
	for (const logro of data ?? []) {
		const lista = porCategoria.get(logro.categoria) ?? [];
		lista.push(logro);
		porCategoria.set(logro.categoria, lista);
	}

	return (
		<div className="app-container space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1>Logros</h1>
					{data && data.length > 0 && (
						<p className="text-muted-foreground text-sm">
							{data.length} {data.length === 1 ? "logro" : "logros"} · se
							desbloquean solos cuando alguien cumple la condición
						</p>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{/* Cerrar el periodo es de cada organización: el superadmin no lo hace. */}
					{hayDeRanking && !soloLectura && <CerrarRanking />}
					<CreateAchievementDialogForm />
				</div>
			</div>

			{isLoading && <LoadingState message="Cargando los logros..." />}

			{!data && error && (
				<ErrorState
					title="No se pudieron cargar los logros"
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
					title="Crea el primer logro"
					description="Usa el botón 'Crear logro' para registrar un nuevo logro de gamificación."
				/>
			)}

			{[...porCategoria.entries()].map(([categoria, logros]) => (
				<section key={categoria} className="space-y-3">
					<h2 className="font-medium text-muted-foreground text-sm">
						{categoria} · {logros.length}
					</h2>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{logros.map((logro) => (
							<AchievementCard
								key={logro.id}
								logro={logro}
								curso={
									logro.cursoId ? nombreCurso.get(logro.cursoId) : undefined
								}
								organizacion={
									esSuper && logro.tenantId
										? nombreEmpresa.get(logro.tenantId)
										: undefined
								}
								// El superadmin edita solo los genéricos (de la plataforma);
								// el admin, solo los de su organización.
								editable={esSuper ? logro.generico : !logro.generico}
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}

/**
 * Cerrar el periodo del ranking: otorga las medallas de puesto a quien está
 * en el lugar ahora mismo. No se dan en tiempo real porque un puesto cambia
 * cada vez que alguien suma puntos.
 */
function CerrarRanking() {
	const [abierto, setAbierto] = useState(false);
	const { cerrarRanking } = useLogroAcciones();

	function cerrar() {
		cerrarRanking.mutate(null, {
			onSuccess: (r) => {
				setAbierto(false);
				toast.success(r.message, {
					description: r.otorgados.length
						? r.otorgados
								.map((o) => `${o.persona.firstname}: ${o.logro.nombre}`)
								.join(" · ")
						: "Nadie nuevo ganó una medalla de puesto.",
					duration: 8000,
				});
			},
			onError: (e: Error) =>
				toast.error("No se pudo cerrar el periodo", { description: e.message }),
		});
	}

	return (
		<>
			<Button variant="outline" onClick={() => setAbierto(true)}>
				<Trophy />
				Cerrar periodo del ranking
			</Button>
			<Dialog open={abierto} onOpenChange={setAbierto}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>¿Cerrar el periodo del ranking?</DialogTitle>
						<DialogDescription>
							Se otorgan las medallas de puesto (por ejemplo, "Top 3") a quien
							esté en ese lugar ahora mismo. Cada medalla se da una sola vez por
							persona: cerrar de nuevo no la duplica. Hazlo al final de cada
							periodo, por ejemplo cada viernes.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setAbierto(false)}>
							Cancelar
						</Button>
						<Button
							onClick={cerrar}
							disabled={cerrarRanking.isPending}
						>
							{cerrarRanking.isPending && <LoaderCircle className="animate-spin" />}
							Cerrar y otorgar
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
