import { createFileRoute } from "@tanstack/react-router";
import { CreateTenantDialogForm } from "#/components/tenants/create-tenant-dialog-form";
import { useAllTenants } from "#/hooks/tenants/use-all-tenants";
import { type Column, GenericTable } from "@/components/tenants/tenants-table";

export const Route = createFileRoute("/(dashboard)/(tenants)/tenants")({
	component: TenantsRoute,
});

const columns: Column<Tenant>[] = [
	{ key: "id", header: "ID" },
	{ key: "name", header: "Nombre" },
	{ key: "domain", header: "Dominio" },
	{
		key: "active",
		header: "Estado",
		render: (tenant) => (
			<span
				className={`rounded-full px-2 py-1 text-xs font-medium ${
					tenant.active
						? "bg-green-100 text-green-700"
						: "bg-gray-100 text-gray-600"
				}`}
			>
				{tenant.active ? "Activo" : "Inactivo"}
			</span>
		),
	},
	{
		key: "createdAt",
		header: "Creado",
		render: (tenant) =>
			new Date(tenant.createdAt).toLocaleDateString("es-CO", {
				year: "numeric",
				month: "short",
				day: "numeric",
			}),
	},
];

function TenantsRoute() {
	const { data, isLoading, isError, error } = useAllTenants();

	if (isError) {
		return (
			<div className="p-6 text-sm text-red-600">
				Error al cargar organizaciones: {error?.message}
			</div>
		);
	}

	return (
		<div className="app-container">
			<div className="mb-4 flex items-center justify-between">
				<h1>Organizaciones</h1>
				<CreateTenantDialogForm />
			</div>

			<GenericTable
				columns={columns}
				data={data ?? []}
				rowKey={(tenant) => tenant.id}
				isLoading={isLoading}
			/>
		</div>
	);
}
