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

export async function apiFetch<T>(
	path: string,
	options: ApiFetchOptions = {},
): Promise<T> {
	const { skipAuthRedirect, ...fetchOptions } = options;

	const token = tokenStorage.get();

	// Un FormData tiene que viajar sin Content-Type puesto a mano: el navegador
	// lo arma con el boundary del multipart. Fijarlo rompe la subida y el
	// backend responde que no encuentra el archivo.
	const esFormData = fetchOptions.body instanceof FormData;

	const res = await fetch(`${BASE_URL}${path}`, {
		...fetchOptions,
		credentials: "include",
		headers: {
			...(esFormData ? {} : { "Content-Type": "application/json" }),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...fetchOptions.headers,
		},
	});

	if (!res.ok) {
		// El backend explica cada fallo con un mensaje pensado para leerse
		// ("Ya existe un logro con ese nombre"). Antes se descartaba y el
		// usuario veía "Request failed: 409".
		const mensaje = await mensajeDe(res, `Request failed: ${res.status}`);

		if (res.status === 401) throw new InvalidCredentialsError(mensaje);
		if (res.status === 403) throw new UnauthorizedError(mensaje);
		if (res.status === 429) throw new TooManyRequestsError(mensaje);
		throw new ApiError(mensaje, res.status);
	}

	// 204 y 205 no traen cuerpo: parsearlos revienta.
	if (res.status === 204 || res.status === 205) return undefined as T;

	return res.json() as Promise<T>;
}
