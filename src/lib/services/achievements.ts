import type { CreateAchievementPayload } from "#/lib/schemas/achievements";
import { apiFetch } from "./api-fetch";

export const achievementsService = {
	async create(values: CreateAchievementPayload) {
		return await apiFetch<GeneralAPIResponse>("/gamification/logros", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},

	async getCreateOptions() {
		return await apiFetch<unknown>("/gamification/logros/opciones");
	},
};