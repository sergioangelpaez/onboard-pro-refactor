import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTenantPayload } from "#/lib/schemas/tenants";
import { tenantsService } from "#/lib/services/tenants";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateTenant() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateTenantPayload) =>
			tenantsService.createTenant(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
		},
	});
}
