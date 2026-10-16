import { useMutation, useQueryClient } from "@tanstack/react-query";
import { tenantsService } from "#/lib/services/tenants";
import { queryKeys } from "@/lib/utils/query-keys";

export function useDeleteTenant() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id }: { id: string }) => tenantsService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.tenants.all });
		},
	});
}
