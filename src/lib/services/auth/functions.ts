import { createServerFn } from "@tanstack/react-start";
import { UnauthorizedError } from "../errors";
import { authService } from ".";

export const getMeFn = createServerFn({ method: "GET" }).handler(async () => {
	try {
		return await authService.getMe();
	} catch (error) {
		if (error instanceof UnauthorizedError) {
			return null;
		}

		return null;
	}
});
