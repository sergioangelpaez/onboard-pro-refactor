import { createFileRoute } from "@tanstack/react-router";
import { Globe, LoaderCircle, RefreshCw } from "lucide-react";
import { useState } from "react";
import {
	type DiasDashboard,
	SelectorPeriodo,
} from "#/components/admin/dashboard/dashboard-parts";
import { VistaOrganizacion } from "#/components/admin/dashboard/vista-organizacion";
import { VistaPlataforma } from "#/components/admin/dashboard/vista-plataforma";
import { ErrorState } from "#/components/shared/states/error-state";
import { LoadingState } from "#/components/shared/states/loading-state";
import { Button } from "#/components/ui/button";
import { useDashboard } from "#/hooks/dashboard/use-dashboard";
import { useOrganizacionActiva } from "#/hooks/tenants/use-organizacion-activa";
import { fechaCorta } from "#/lib/utils/fechas";
import { setTenantActivo } from "#/lib/utils/tenant-activo";

export const Route = createFileRoute("/admin/home")({
	component: HomeRoute,
});

/**
 * El panel de inicio de la administración.
 *
 * Una misma pantalla con dos vistas, según lo que devuelva el backend: el
 * superadmin sin organización elegida ve la plataforma entera; el admin, o el
 * superadmin parado en una organización, ve esa empresa. Se decide por el
 * `alcance` de la respuesta y no por el rol, para no duplicar acá la regla
 * que ya aplica el servidor.
 */
function HomeRoute() {
	const organizacion = useOrganizacionActiva();
	const [dias, setDias] = useState<DiasDashboard>(30);
	const { data, isLoading, isFetching, error, refetch } = useDashboard(
		organizacion,
		dias,
	);

	const titulo =
		data?.alcance === "organizacion" ? data.organizacion.nombre : "Plataforma";

	return (
		<div className="app-container space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="min-w-0">
					<h1 className="flex items-center gap-2">
						Resumen
						{isFetching && !isLoading && (
							<LoaderCircle
								className="size-4 animate-spin text-muted-foreground"
								aria-label="Actualizando"
							/>
						)}
					</h1>
					<p className="text-muted-foreground">
						{data ? (
							<>
								{titulo} · del {fechaCorta(data.periodo.desde)} al{" "}
								{fechaCorta(data.periodo.hasta)}
							</>
						) : (
							"Cómo viene el onboarding en el periodo elegido."
						)}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					{/* Desde la vista de una empresa, volver a la plataforma sin pasar
					    por el selector del menú. */}
					{organizacion && data?.alcance === "organizacion" && (
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setTenantActivo(null)}
						>
							<Globe />
							Ver toda la plataforma
						</Button>
					)}
					<SelectorPeriodo valor={dias} onCambiar={setDias} />
				</div>
			</div>

			{isLoading && <LoadingState message="Cargando el resumen..." />}

			{!data && error && (
				<ErrorState
					title="No se pudo cargar el resumen"
					description={error.message}
					content={
						<Button onClick={() => refetch()}>
							<RefreshCw />
							Reintentar
						</Button>
					}
				/>
			)}

			{data?.alcance === "plataforma" && <VistaPlataforma data={data} />}
			{data?.alcance === "organizacion" && <VistaOrganizacion data={data} />}
		</div>
	);
}
