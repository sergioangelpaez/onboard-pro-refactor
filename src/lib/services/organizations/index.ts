import { apiFetch } from "../api-fetch";

export const organizationsService = {
	async getAllTenants() {
		return await apiFetch<Tenant[]>("/tenants/get/all");
	},

	async createTenant(payload: CreateTenantPayload) {
		return await apiFetch<Tenant>("/tenants/create", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
};
