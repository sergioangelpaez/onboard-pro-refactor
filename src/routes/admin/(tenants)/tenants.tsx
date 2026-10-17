import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { TenantFormSheet } from "#/components/admin/tenants/tenants-form";
import { TenantsRouteContent } from "#/components/admin/tenants/tenants-route-content";
import { Button } from "#/components/ui/button";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";

export const Route = createFileRoute("/admin/(tenants)/tenants")({
	component: TenantsRoute,
});

function TenantsRoute() {
	const [isFormOpen, setIsFormOpen] = useState(false);
	const { data, isLoading, error, refetch } = useAllTenants();

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Organizaciones</h1>
				<Button onClick={() => setIsFormOpen(true)}>
					<Plus />
					Crear organización
				</Button>
			</div>

			<TenantsRouteContent
				data={data}
				isLoading={isLoading}
				error={error}
				refetch={refetch}
				onCreate={() => setIsFormOpen(true)}
			/>

			<TenantFormSheet open={isFormOpen} onOpenChange={setIsFormOpen} />
		</div>
	);
}
