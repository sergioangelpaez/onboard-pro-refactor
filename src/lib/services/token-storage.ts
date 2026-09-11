import { getCookie } from "@tanstack/react-start/server";
import Cookies from "js-cookie";

const SESSION_TOKEN_KEY = "session_token";

export const tokenStorage = {
	get: () => {
		if (typeof document === "undefined") {
			return getCookie(SESSION_TOKEN_KEY) ?? null;
		}
		return Cookies.get(SESSION_TOKEN_KEY) ?? null;
	},
	set: (token: string) =>
		Cookies.set(SESSION_TOKEN_KEY, token, {
			expires: 7,
			secure: true,
			sameSite: "strict",
		}),
	remove: () => Cookies.remove(SESSION_TOKEN_KEY),
};
