import type { Activity, Material } from "../schemas/activities";
import { apiFetch } from "./api-fetch";

export const activitiesService = {
	async getAll() {
		return await apiFetch<Activity[]>("/activities/get/all");
	},

	/**
	 * Crea una actividad dentro de una seccion (HU-034).
	 *
	 * Va como FormData porque el adjunto viaja en la misma peticion. El
	 * backend espera cada dato en su propio campo, no un JSON: por eso los
	 * booleanos y los numeros se mandan como texto y alla se convierten.
	 */
	async create(payload: {
		sectionId: string;
		name: string;
		title: string;
		type: string;
		description?: string;
		deliverable: boolean;
		xp?: number;
		file?: File | null;
	}) {
		const body = new FormData();
		body.append("sectionId", payload.sectionId);
		body.append("name", payload.name);
		body.append("title", payload.title);
		body.append("type", payload.type);
		body.append("deliverable", String(payload.deliverable));
		if (payload.description) body.append("description", payload.description);
		if (payload.xp !== undefined) body.append("xp", String(payload.xp));
		if (payload.file) body.append("archivo", payload.file);

		return await apiFetch<Activity>("/activities/create", {
			method: "POST",
			body,
		});
	},

	/** El material de apoyo de una actividad, con su enlace temporal (HU-038). */
	async getMaterials(activityId: string) {
		return await apiFetch<Material[]>(`/activities/${activityId}/materiales`);
	},

	/**
	 * Agrega un archivo a la actividad (HU-037).
	 *
	 * Se manda como FormData a proposito: apiFetch detecta que lo es y no fija
	 * el Content-Type, para que el navegador escriba el boundary del multipart.
	 */
	async addMaterial(activityId: string, file: File) {
		const body = new FormData();
		body.append("archivo", file);

		return await apiFetch<{ message: string; materialId: string }>(
			`/activities/${activityId}/materiales`,
			{ method: "POST", body },
		);
	},

	/** Quita un archivo. Se borra tambien del almacenamiento (HU-039). */
	async deleteMaterial(materialId: string) {
		return await apiFetch<{ message: string; nombre: string }>(
			`/materiales/${materialId}`,
			{ method: "DELETE" },
		);
	},
};
