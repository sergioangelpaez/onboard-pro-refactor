import type { Activity, CreateActivityFormValues } from "../schemas/activities";
import { apiFetch } from "./api-fetch";

export const activitiesService = {
	async getAll() {
		return await apiFetch<Activity[]>("/activities/get/all");
	},

	async create(activity: CreateActivityFormValues) {
		const body = new FormData();
		body.append("name", activity.name);
		body.append("title", activity.title);
		body.append("type", activity.type);
		body.append("description", activity.description);
		body.append("deliverable", String(activity.deliverable));
		body.append("sectionId", activity.sectionId);
		body.append("archivo", activity.archivo);

		return await apiFetch<Activity>("/activities/create", {
			method: "POST",
			body,
		});
	},
};
