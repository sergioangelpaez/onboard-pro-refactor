import type {
	Course,
	CreateCoursePayload,
	Section,
} from "#/lib/schemas/courses";
import { apiFetch } from "./api-fetch";

export const coursesService = {
	async create(values: CreateCoursePayload) {
		// Devuelve el curso con su id, que hace falta para colgarle cosas.
		return await apiFetch<Course>("/courses/create", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},

	async getAll() {
		return await apiFetch<Course[]>("/courses/get/all");
	},

	async getById(id: string) {
		return await apiFetch<Course>(`/courses/get/id/${id}`);
	},

	/** Crea una seccion al final del curso (HU-032). */
	async createSection(courseId: string, name: string) {
		return await apiFetch<Section>(`/courses/${courseId}/sections`, {
			method: "POST",
			body: JSON.stringify({ name }),
		});
	},

	/** Las secciones del curso con sus actividades, en orden. */
	async getSections(id: string) {
		return await apiFetch<Section[]>(`/courses/${id}/sections`);
	},
};
