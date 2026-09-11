import { createServerFn } from "@tanstack/react-start";
import { organizationsService } from ".";

export const getAllTenantsFn = createServerFn({ method: "GET" }).handler(
	async () => {
		const response = await organizationsService
			.getAllTenants()
			.catch((error) => {
				console.error("Error fetching tenants:", error);
				throw new Error("Failed to fetch tenants");
			});

		return response;
	},
);

export const createTenantFn = createServerFn({ method: "POST" })
	.validator((payload: CreateTenantPayload) => payload)
	.handler(async ({ data }) => {
		const response = await organizationsService
			.createTenant(data)
			.catch((error) => {
				console.error("Error creating tenant:", error);
				throw new Error("Failed to create tenant");
			});

		return response;
	});
