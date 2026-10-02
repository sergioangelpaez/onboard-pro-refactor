import type { CreateGroupPayload, Group } from "../schemas/groups";
import { apiFetch } from "./api-fetch";

export const groupsService = {
	async create(payload: CreateGroupPayload) {
		return await apiFetch<Group>("/groups/create", {
			method: "POST",
			body: JSON.stringify(payload),
		});
	},

	async getAll() {
		return await apiFetch<Group[]>("/groups/get/all", {
			method: "GET",
		});
	},
};
