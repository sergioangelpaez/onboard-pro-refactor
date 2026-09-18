import type { ChangePasswordPayload } from "#/lib/schemas/auth";
import { apiFetch } from "../api-fetch";
import { tokenStorage } from "../token-storage";

export const authService = {
	/** Fetches the current authenticated user's data. */
	async getMe() {
		const response = await apiFetch<GetMeResponse>("/auth/me");
		return response.userData;
	},

	/** Logs in a user with the provided email and password. */
	async logIn({ email, password }: { email: string; password: string }) {
		const response = await apiFetch<LocalUserResponse>("/auth/localuser", {
			method: "POST",
			body: JSON.stringify({ email, password }),
			skipAuthRedirect: true,
		});

		if (response.token) {
			tokenStorage.set(response.token);
		}

		return response;
	},

	/** Returns the URL for Google login. */
	googleLogin() {
		return `${import.meta.env.VITE_API_URL}/auth/google`;
	},

	/** Returns the URL for Microsoft login. */
	microsoftLogin() {
		return `${import.meta.env.VITE_API_URL}/auth/microsoft`;
	},

	/** Logs out the current user by removing the token and redirecting to the auth page. */
	logOut() {
		tokenStorage.remove();
		window.location.href = "/auth";
	},

	/** Changes the password for the current authenticated user. */
	async changePassword(values: ChangePasswordPayload) {
		return await apiFetch<GeneralAPIResponse>("/auth/change-password", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},
};
