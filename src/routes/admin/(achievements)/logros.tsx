import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { AchievementCard } from "#/components/admin/achievements/achievement-card";
import { CreateAchievementDialogForm } from "#/components/admin/achievements/create-achievement-dialog-form";
import { EmptyState } from "#/components/shared/states/empty-state";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Button } from "#/components/ui/button";
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
	const { data: empresas } = useAllTenants(esSuper);
	const nombreEmpresa = new Map((empresas ?? []).map((e) => [e.id, e.name]));

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
				<CreateAchievementDialogForm />
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
							/>
						))}
					</div>
				</section>
			))}
		</div>
	);
}
