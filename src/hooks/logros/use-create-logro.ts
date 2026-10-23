import { useMutation } from "@tanstack/react-query";
import { logrosService } from "#/lib/services/logros";

export function useCreateLogro() {
	return useMutation({ mutationFn: logrosService.create });
}
