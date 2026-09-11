import { createFileRoute } from "@tanstack/react-router";
import { useAllOrganizations } from "#/hooks/tenants/tenants";
import { CreateTenantFormDialog } from "@/components/tenants/create-tenant-form";
import { type Column, GenericTable } from "@/components/tenants/tenants-table";

export const Route = createFileRoute("/(dashboard)/(organizations)/tenants")({
	component: RouteComponent,
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

function RouteComponent() {
	const { data, isLoading, isError, error } = useAllOrganizations();

	if (isError) {
		return (
			<div className="p-6 text-sm text-red-600">
				Error al cargar organizaciones: {error?.message}
			</div>
		);
	}

	return (
		<div className="p-6 w-full">
			<div className="mb-4 flex items-center justify-between">
				<h1>Organizaciones</h1>
				<CreateTenantFormDialog />
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
