import type {
	CreateGroupPayload,
	Group,
	UpdateGroupPayload,
} from "../schemas/groups";
import { apiFetch } from "./api-fetch";

export const groupsService = {
	async getAll() {
		return await apiFetch<Group[]>("/groups/get/all", {
			method: "GET",
		});
	},

	async create(payload: CreateGroupPayload) {
		return await apiFetch<Group>("/groups/create", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	async update(id: string, payload: UpdateGroupPayload) {
		return await apiFetch<Group>(`/groups/update/${id}`, {
			method: "PUT",
			body: JSON.stringify(payload),
		});
	},

	async delete(id: string) {
		return await apiFetch<void>(`/groups/delete/${id}`, {
			method: "DELETE",
		});
	},
};
