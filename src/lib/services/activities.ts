import type {
	Activity,
	CreateActivityFormValues,
	Material,
	UpdateActivityFormValues,
} from "../schemas/activities";
import { apiFetch } from "./api-fetch";

/** Lo que vuelve al completar una actividad: el XP, el nivel y lo que se ganó. */
export interface ResultadoXp {
	message?: string;
	xpGanado?: number;
	xpBase?: number;
	/** Si sumó menos de lo que vale (por ejemplo, un reintento), el motivo. */
	avisoXp?: string | null;
	nivel?: number;
	nombreNivel?: string | null;
	subioDeNivel?: boolean;
	logrosDesbloqueados?: {
		id: string;
		nombre: string;
		icono: string;
		xpRecompensa: number;
	}[];
}

export const activitiesService = {
	/** El mínimo, el recomendado y el máximo de XP de cada tipo. */
	async reglasXp() {
		return await apiFetch<
			Record<string, { minimo: number; recomendado: number; maximo: number }>
		>("/activities/reglas-xp");
	},

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
		body.append("xp", String(activity.xp));
		if (activity.archivo) body.append("archivo", activity.archivo);

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

	/** El material de apoyo de una actividad, con su enlace temporal (HU-038). */
	async getMaterials(activityId: string) {
		return await apiFetch<Material[]>(`/activities/${activityId}/materiales`);
	},

	/**
	 * Agrega un archivo a la actividad (HU-037). Se suma a los que ya estaban:
	 * no los reemplaza.
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

	async complete(id: string) {
		return await apiFetch<ResultadoXp>(`/gamification/activities/${id}/completar`, {
			method: "POST",
		});
	},
};
