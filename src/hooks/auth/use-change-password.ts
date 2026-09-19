import { useMutation } from "@tanstack/react-query";
import type { ChangePasswordPayload } from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";

export function useChangePassword() {
	return useMutation({
		mutationFn: (values: ChangePasswordPayload) =>
			authService.changePassword(values),
	});
}
