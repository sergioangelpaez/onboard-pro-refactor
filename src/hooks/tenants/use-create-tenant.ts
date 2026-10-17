import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TenantPayload } from "#/lib/schemas/tenants";
import { tenantsService } from "#/lib/services/tenants";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateTenant() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: TenantPayload) => tenantsService.create(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
		},
	});
}
