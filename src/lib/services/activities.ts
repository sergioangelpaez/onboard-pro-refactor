import type { Activity } from "../schemas/activities";
import { apiFetch } from "./api-fetch";

export const activitiesService = {
	async getAll() {
		return await apiFetch<Activity[]>("/activities/get/all");
	},
};
