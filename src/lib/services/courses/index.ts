import type { Course, CreateCoursePayloadSchema } from "#/lib/schemas/courses";
import { apiFetch } from "../api-fetch";

export const coursesService = {
	async createCourse(values: CreateCoursePayloadSchema) {
		return await apiFetch<Course>("/courses", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},
};
