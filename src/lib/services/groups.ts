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

	/** Suma integrantes al grupo. El backend espera { userIds: [...] }. */
	async addUsers(id: string, userIds: string[]) {
		return await apiFetch<GeneralAPIResponse>(`/groups/${id}/add-users`, {
			method: "POST",
			body: JSON.stringify({ userIds }),
		});
	},

	/** Saca integrantes del grupo. No borra al usuario, solo lo desvincula. */
	async removeUsers(id: string, userIds: string[]) {
		return await apiFetch<GeneralAPIResponse>(`/groups/${id}/remove-users`, {
			method: "DELETE",
			body: JSON.stringify({ userIds }),
		});
	},

	async delete(id: string) {
		return await apiFetch<void>(`/groups/delete/${id}`, {
			method: "DELETE",
		});
	},

	async getMine() {
		return await apiFetch<Group[]>("/groups/me");
	},

	async addCourses(id: string, courseIds: string[]) {
		return await apiFetch<void>(`/groups/${id}/add-courses`, {
			method: "POST",
			body: JSON.stringify({ courseIds }),
		});
	},
};
