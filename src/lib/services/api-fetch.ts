import { UnauthorizedError } from "./errors";
import { tokenStorage } from "./token-storage";

const BASE_URL = import.meta.env.VITE_API_URL;

interface ApiFetchOptions extends RequestInit {
	skipAuthRedirect?: boolean;
}

export async function apiFetch<T>(
	path: string,
	options: ApiFetchOptions = {},
): Promise<T> {
	const { skipAuthRedirect, ...fetchOptions } = options;

	const token = tokenStorage.get();

	const res = await fetch(`${BASE_URL}${path}`, {
		...fetchOptions,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...fetchOptions.headers,
		},
	});

	if (!res.ok) {
		if (res.status === 401) {
			throw new UnauthorizedError();
		}

		if (res.status === 404) {
			throw new Error(
				"Credenciales incorrectas. Por favor, verifica tu correo electrónico y contraseña.",
			);
		}

		throw new Error(`Request failed: ${res.status}`);
	}

	return res.json() as Promise<T>;
}
