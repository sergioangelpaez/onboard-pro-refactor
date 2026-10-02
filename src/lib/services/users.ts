import type {
	CreateUserPayload,
	UpdateUserPayload,
	User,
} from "../schemas/users";
import { apiFetch } from "./api-fetch";

export const usersService = {
	async create(user: CreateUserPayload) {
		return await apiFetch<User>("/users/create", {
			method: "POST",
			body: JSON.stringify(user),
		});
	},

	async update(id: string, user: UpdateUserPayload) {
		return await apiFetch<User>(`/users/update/${id}`, {
			method: "PUT",
			body: JSON.stringify(user),
		});
	},

	async getAll() {
		return await apiFetch<User[]>("/users/get/all", {
			method: "GET",
		});
	},
};
