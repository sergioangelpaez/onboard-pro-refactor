import type {
	Course,
	CreateCoursePayload,
	Section,
	UpdateCoursePayload,
} from "#/lib/schemas/courses";
import { apiFetch } from "./api-fetch";

export interface CourseImpact {
	curso: { id: string; nombre: string; archivado: boolean };
	/** Aprendices que lo tienen asignado por sus grupos. */
	aprendices: number;
	grupos: number;
	secciones: number;
	actividades: number;
	entregas: number;
	intentosDeExamen: number;
	actividadesCompletadas: number;
}

/** `GET /courses/:id/participantes`: quiénes están en el curso. */
export interface CourseParticipants {
	curso: { id: string; nombre: string };
	instructor: {
		id: string | null;
		email: string;
		firstname: string | null;
		lastname: string | null;
		role: string;
		/** null si no cargó un número. */
		telefono?: string | null;
	} | null;
	grupos: { id: string; nombre: string }[];
	/** El correo solo llega a quien administra o dicta el curso. */
	aprendices: {
		id: string;
		firstname: string;
		lastname: string;
		level: number;
		email?: string;
	}[];
	total: number;
}

export const coursesService = {
	/** El instructor, los grupos y los aprendices del curso. */
	async participants(id: string) {
		return await apiFetch<CourseParticipants>(`/courses/${id}/participantes`);
	},

	async create(values: CreateCoursePayload) {
		// Devuelve el curso con su id, que hace falta para colgarle cosas.
		return await apiFetch<Course>("/courses/create", {
			method: "POST",
			body: JSON.stringify(values),
		});
	},

	/**
	 * Edita el curso. Pasar a "Abierto" es publicarlo: un curso sin
	 * actividades no se puede publicar y el backend responde 409.
	 */
	async update(id: string, values: UpdateCoursePayload) {
		return await apiFetch<{ message: string; curso: Course }>(
			`/courses/update/${id}`,
			{
				method: "PUT",
				body: JSON.stringify(values),
			},
		);
	},

	/**
	 * Borra el curso para siempre: secciones, actividades, entregas, intentos y
	 * todos sus archivos. Solo administradores. El XP ganado se conserva.
	 */
	async delete(id: string) {
		return await apiFetch<{
			message: string;
			actividades: number;
			archivosBorrados: number;
		}>(`/courses/delete/${id}`, { method: "DELETE" });
	},

	/** Archivar lo saca del catálogo y de los aprendices, sin perder nada. Se puede deshacer. */
	async archive(id: string, archivado: boolean) {
		return await apiFetch<{ message: string; archivado: boolean }>(
			`/courses/${id}/archivar`,
			{ method: "PUT", body: JSON.stringify({ archivado }) },
		);
	},

	/** Lo que se perdería al borrar: para mostrarlo en la confirmación. */
	async impact(id: string) {
		return await apiFetch<CourseImpact>(`/courses/${id}/impacto`);
	},

	/** Sin `archivados` no vienen los archivados; con "solo", únicamente esos. */
	async getAll(archivados?: "solo") {
		return await apiFetch<Course[]>(
			`/courses/get/all${archivados ? `?archivados=${archivados}` : ""}`,
		);
	},

	/**
	 * Los cursos que me tocan por mis grupos. Para un aprendiz el backend ya
	 * deja afuera los despublicados.
	 */
	async mine() {
		return await apiFetch<Course[]>("/courses/me");
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
