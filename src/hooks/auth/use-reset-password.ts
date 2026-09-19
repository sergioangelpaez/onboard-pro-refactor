import { useMutation } from "@tanstack/react-query";
import type { ResetPasswordPayload } from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";

export function useResetPassword() {
	return useMutation({
		mutationFn: (values: ResetPasswordPayload) =>
			authService.resetPassword(values),
	});
}
