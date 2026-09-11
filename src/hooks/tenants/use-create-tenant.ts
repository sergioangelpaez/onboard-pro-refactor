import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTenantFn } from "#/lib/services/organizations/functions";
import { queryKeys } from "#/lib/utils/query-keys";

export function useCreateTenant() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateTenantPayload) =>
			createTenantFn({ data: payload }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
		},
	});
}
