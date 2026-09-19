import type { CreateCoursePayload } from "#/lib/schemas/courses";
import { apiFetch } from "./api-fetch";

export const coursesService = {
	async createCourse(values: CreateCoursePayload) {
		return await apiFetch<GeneralAPIResponse>("/courses/create", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},
};
