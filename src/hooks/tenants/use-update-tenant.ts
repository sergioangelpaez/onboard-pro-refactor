import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { TenantPayload } from "#/lib/schemas/tenants";
import { tenantsService } from "#/lib/services/tenants";
import { queryKeys } from "#/lib/utils/query-keys";

export function useUpdateTenant() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }: { id: string; payload: TenantPayload }) =>
			tenantsService.update(id, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
		},
	});
}
