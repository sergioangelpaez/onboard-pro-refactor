import type {
	Activity,
	CreateActivityFormValues,
	UpdateActivityFormValues,
} from "../schemas/activities";
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

	async update(id: string, values: UpdateActivityFormValues) {
		const fields = {
			name: values.name,
			title: values.title,
			type: values.type,
			description: values.description,
			deliverable: values.deliverable,
			xp: values.xp,
		};

		if (values.archivo instanceof File) {
			const body = new FormData();
			for (const [key, value] of Object.entries(fields)) {
				body.append(key, String(value));
			}
			body.append("archivo", values.archivo);

			return await apiFetch<Activity>(`/activities/${id}`, {
				method: "PUT",
				body,
			});
		}

		return await apiFetch<Activity>(`/activities/${id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(fields),
		});
	},

	async delete(id: string) {
		return await apiFetch<void>(`/activities/${id}`, {
			method: "DELETE",
		});
	},
};
