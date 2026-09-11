import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import Cookies from "js-cookie";

const SESSION_TOKEN_KEY = "session_token";

const getToken = createIsomorphicFn()
	.server(() => getCookie(SESSION_TOKEN_KEY) ?? null)
	.client(() => Cookies.get(SESSION_TOKEN_KEY) ?? null);

export const tokenStorage = {
	get: getToken,
	set: (token: string) =>
		Cookies.set(SESSION_TOKEN_KEY, token, {
			expires: 7,
			secure: true,
			sameSite: "strict",
		}),
	remove: () => Cookies.remove(SESSION_TOKEN_KEY),
};
