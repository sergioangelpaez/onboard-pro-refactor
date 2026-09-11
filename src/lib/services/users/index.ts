import { apiFetch } from "../api-fetch";

export const usersService = {
	async createUser(payload: CreateUserPayload) {
		return await apiFetch<User>("/users/create", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},
};
