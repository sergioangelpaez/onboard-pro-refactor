import type { Course, CreateCoursePayload } from "#/lib/schemas/courses";
import { apiFetch } from "./api-fetch";

export const coursesService = {
	async create(values: CreateCoursePayload) {
		return await apiFetch<GeneralAPIResponse>("/courses/create", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},

	async update(id: string, values: CreateCoursePayload) {
		await Promise.resolve();
		console.info("[front-only] update course", { id, values });
		return { message: "Curso actualizado (front-only)" } as GeneralAPIResponse;
	},

	async delete(id: string) {
		await Promise.resolve();
		console.info("[front-only] delete course", { id });
		return { message: "Curso eliminado (front-only)" } as GeneralAPIResponse;
	},

	async getAll() {
		return await apiFetch<Course[]>("/courses/get/all");
	},
};
