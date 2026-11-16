import type {
	CreateUserPayload,
	UpdateUserPayload,
	User,
} from "../schemas/users";
import { apiFetch } from "./api-fetch";
import { ApiError } from "./errors";
import { tokenStorage } from "./token-storage";

/** Una fila del archivo de carga masiva, tal como la leyó el backend. */
export interface FilaImportacion {
	/** Número de fila en el archivo, contando el encabezado como la 1. */
	fila: number;
	datos: {
		firstname: string;
		lastname: string;
		email: string;
		role: string;
		phonumber: string;
		grupo: string;
	};
	/** Por qué no se puede crear. Vacío si la fila está bien. */
	errores: string[];
	/** El correo ya existe: la fila se va a omitir. */
	duplicado: boolean;
}

/** `POST /users/import/preview`: qué pasaría, sin crear nada. */
export interface PreviewImportacion {
	filas: FilaImportacion[];
	resumen: {
		total: number;
		validas: number;
		conErrores: number;
		duplicadas: number;
	};
}

/** `POST /users/import`: lo que efectivamente se creó. */
export interface ResultadoImportacion {
	message: string;
	creados: number;
	conGrupo: number;
	omitidas: { fila: number; email: string; motivo: string }[];
}

/**
 * El cuerpo de la carga masiva. El superadmin tiene que decir en qué
 * organización van las personas; a los demás el backend se la toma del token.
 */
function cuerpoImportacion(archivo: File, tenantId?: string | null) {
	const body = new FormData();
	body.append("archivo", archivo);
	if (tenantId) body.append("tenantId", tenantId);
	return body;
}

export const usersService = {
	async create(user: CreateUserPayload) {
		return await apiFetch<User>("/users/create", {
			method: "POST",
			body: JSON.stringify(user),
		});
	},

	async update(id: string, user: UpdateUserPayload) {
		return await apiFetch<User>(`/users/update/${id}`, {
			method: "PUT",
			body: JSON.stringify(user),
		});
	},

	async delete(id: string) {
		return await apiFetch(`/users/delete/${id}`, {
			method: "DELETE",
		});
	},

	/**
	 * Descarga la plantilla CSV de carga masiva.
	 *
	 * No pasa por `apiFetch` porque ese siempre interpreta la respuesta como
	 * JSON y acá llega un archivo: se pide a mano con el mismo token y se
	 * entrega al navegador como descarga.
	 */
	async descargarPlantilla() {
		const token = tokenStorage.get();
		const res = await fetch(
			`${import.meta.env.VITE_API_URL}/users/import/plantilla`,
			{
				credentials: "include",
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			},
		);
		if (!res.ok) {
			let mensaje = `Request failed: ${res.status}`;
			try {
				const cuerpo = await res.json();
				mensaje = cuerpo?.message ?? cuerpo?.error ?? mensaje;
			} catch {
				// Sin cuerpo JSON: queda el mensaje genérico.
			}
			throw new ApiError(mensaje, res.status);
		}

		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const enlace = document.createElement("a");
		enlace.href = url;
		enlace.download = "plantilla-usuarios.csv";
		document.body.appendChild(enlace);
		enlace.click();
		enlace.remove();
		URL.revokeObjectURL(url);
	},

	/** Lee el archivo y dice qué filas se pueden crear, sin crear nada. */
	async previsualizarImportacion(archivo: File, tenantId?: string | null) {
		return await apiFetch<PreviewImportacion>("/users/import/preview", {
			method: "POST",
			body: cuerpoImportacion(archivo, tenantId),
		});
	},

	/** Crea las filas válidas del archivo y omite el resto, diciendo por qué. */
	async importar(archivo: File, tenantId?: string | null) {
		return await apiFetch<ResultadoImportacion>("/users/import", {
			method: "POST",
			body: cuerpoImportacion(archivo, tenantId),
		});
	},

	async getAll() {
		return await apiFetch<User[]>("/users/get/all", {
			method: "GET",
		});
	},
};
