import type { Section } from "../schemas/sections";
import { apiFetch } from "./api-fetch";

export const sectionsService = {
	async getByCourse(courseId: string) {
		return await apiFetch<Section[]>(`/courses/${courseId}/sections`);
	},
};
