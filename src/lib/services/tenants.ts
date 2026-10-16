import type { Tenant, TenantPayload } from "../schemas/tenants";
import { apiFetch } from "./api-fetch";

export const tenantsService = {
	async getAllTenants() {
		return await apiFetch<Tenant[]>("/tenants/get/all");
	},

	async create(payload: TenantPayload) {
		return await apiFetch<Tenant>("/tenants/create", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	async update(id: string, payload: TenantPayload) {
		return await apiFetch<Tenant>(`/tenants/update/${id}`, {
			method: "PUT",
			body: JSON.stringify(payload),
		});
	},

	async delete(id: string) {
		return await apiFetch<void>(`/tenants/delete/${id}`, {
			method: "DELETE",
		});
	},
};
