import { useMutation } from "@tanstack/react-query";
import type { ForgotPasswordValues } from "#/lib/schemas/auth";
import { authService } from "#/lib/services/auth";

export function useForgotPassword() {
	return useMutation({
		mutationFn: (values: ForgotPasswordValues) =>
			authService.forgotPassword(values),
	});
}
