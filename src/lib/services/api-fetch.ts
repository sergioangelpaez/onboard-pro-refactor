import {
	ApiError,
	InvalidCredentialsError,
	TooManyRequestsError,
	UnauthorizedError,
} from "./errors";
import { tokenStorage } from "./token-storage";

const BASE_URL = import.meta.env.VITE_API_URL;

interface ApiFetchOptions extends RequestInit {
	skipAuthRedirect?: boolean;
}

/** El mensaje que explica el fallo, si el backend mandó uno. */
async function mensajeDe(res: Response, porDefecto: string) {
	try {
		const cuerpo = await res.clone().json();
		return cuerpo?.message ?? cuerpo?.error ?? porDefecto;
	} catch {
		return porDefecto;
	}
}

async function codigoDe(res: Response) {
	try {
		return (await res.clone().json())?.codigo as string | undefined;
	} catch {
		return undefined;
	}
}

export async function apiFetch<T>(
	path: string,
	options: ApiFetchOptions = {},
): Promise<T> {
	const { skipAuthRedirect, ...fetchOptions } = options;

	const token = tokenStorage.get();
	const isFormData = fetchOptions.body instanceof FormData;

	const res = await fetch(`${BASE_URL}${path}`, {
		...fetchOptions,
		credentials: "include",
		headers: {
			...(isFormData ? {} : { "Content-Type": "application/json" }),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...fetchOptions.headers,
		},
	});

	if (!res.ok) {
		// El backend explica cada fallo con un mensaje pensado para leerse
		// ("Ya existe un logro con ese nombre"). Sin esto el usuario veía
		// "Request failed: 409" y no sabía qué corregir.
		const mensaje = await mensajeDe(res, `Request failed: ${res.status}`);

		// Contraseña temporal sin cambiar: el backend no deja hacer nada más.
		// Los guards ya llevan a la pantalla de cambio; esto cubre una sesión
		// que quedó abierta en otra pestaña.
		if (
			res.status === 403 &&
			(await codigoDe(res)) === "CAMBIO_PASSWORD_REQUERIDO" &&
			typeof window !== "undefined" &&
			window.location.pathname !== "/cambiar-password"
		) {
			window.location.href = "/cambiar-password";
		}

		if (res.status === 401) throw new InvalidCredentialsError(mensaje);
		if (res.status === 403) throw new UnauthorizedError(mensaje);
		if (res.status === 429) throw new TooManyRequestsError(mensaje);
		throw new ApiError(mensaje, res.status);
	}

	// 204 y 205 no traen cuerpo: parsearlos revienta.
	if (res.status === 204 || res.status === 205) return undefined as T;

	return res.json() as Promise<T>;
}
