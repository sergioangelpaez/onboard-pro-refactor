import { useMutation, useQueryClient } from "@tanstack/react-query";
import { groupsService } from "#/lib/services/groups";
import { queryKeys } from "#/lib/utils/query-keys";

export function useAddCourses() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, coursesIds }: { id: string; coursesIds: string[] }) =>
			groupsService.addCourses(id, coursesIds),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
		},
	});
}
