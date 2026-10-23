import type {
	ChangePasswordPayload,
	ForgotPasswordValues,
	ResetPasswordPayload,
} from "#/lib/schemas/auth";
import { apiFetch } from "./api-fetch";
import { tokenStorage } from "./token-storage";

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

	/**
	 * Edita mis propios datos. Solo nombre, apellido y teléfono: el correo
	 * identifica la cuenta y el rol lo cambia un administrador.
	 */
	async updateMe(values: {
		firstname?: string;
		lastname?: string;
		phonumber?: string;
	}) {
		return await apiFetch<{ message: string }>("/auth/me", {
			method: "PUT",
			body: JSON.stringify(values),
		});
	},

	/** Changes the password for the current authenticated user. */
	async changePassword(values: ChangePasswordPayload) {
		return await apiFetch<GeneralAPIResponse>("/auth/change-password", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},

	/** Initiates the forgot password process by sending a reset link to the user's email. */
	async forgotPassword(values: ForgotPasswordValues) {
		return await apiFetch<GeneralAPIResponse>("/auth/forgot-password", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},

	/** Resets the user's password using the provided token and new password. */
	async resetPassword(values: ResetPasswordPayload) {
		return await apiFetch<GeneralAPIResponse>("/auth/reset-password", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},
};
